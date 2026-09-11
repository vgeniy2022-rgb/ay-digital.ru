import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID, createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
// @ts-expect-error Server-only ESM handlers.
import { handleTemplateLead, cleanupTemplateUploads, readTemplateLead, templateLeadConfiguration } from '../../../../api/_templateLeads.mjs';
// @ts-expect-error Server-only ESM validator.
import { validateTemplateLead } from '../../../../api/_templateLeadValidation.mjs';
// @ts-expect-error Server image decoder.
import { normalizeTemplateImage, privateTemplateFiles } from '../../../../api/_templatePrivateFiles.mjs';
// @ts-expect-error Existing owner API, no new authentication stack.
import { createVisitorOwnerHandler } from '../../../../api/visitor-owner.mjs';
// @ts-expect-error Existing visitor integration.
import { trackVisitorEvent, readVisitor, authorizeOwnerRequest } from '../../../../api/_visitorIntelligenceCore.mjs';
import { getTemplatePackage, publishedTemplates } from '../catalog/catalog';
import { capture, createTemplateHarness, templateFixture } from './leadTestHarness';

test('all catalog Studio snapshots validate and server package comes only from shared pricing',async()=>{
  for(let i=0;i<publishedTemplates.length;i++) {
    const fixture=await templateFixture(i);
    const result=validateTemplateLead({...fixture.body,package:{price:'1 рубль'}});
    assert.deepEqual(result.package,getTemplatePackage(publishedTemplates[i]));
    assert.equal(result.template.id,publishedTemplates[i].id);
    assert.equal(result.template.version,publishedTemplates[i].version);
    assert.equal(result.template.name,publishedTemplates[i].name);
    assert.equal(result.project.pages[0].data.content.length,fixture.body.project.pages[0].data.content.length);
    assert.equal(result.visitorSessionId,fixture.body.visitorSessionId);
  }
});
test('reject forged content, external URLs, CSS, missing consent, version and invalid image manifest',async()=>{
  const {body}=await templateFixture();
  const reject=(change:(value:typeof body)=>void)=>{const copy=structuredClone(body);change(copy);assert.throws(()=>validateTemplateLead(copy));};
  reject(v=>{v.contact.consent=false;});
  reject(v=>{v.template.version='9.0.0';});
  reject(v=>{v.project.pages[0].data.content[1].type='RawHTML';});
  reject(v=>{v.project.pages[0].data.content[1].props.image='https://tracker.invalid/photo.png';});
  reject(v=>{v.project.theme.colors.accent='url(https://tracker.invalid)';});
  reject(v=>{v.project.theme.shadows=['url(https://tracker.invalid)'];});
  reject(v=>{v.project.pages[0].data.root.props=JSON.parse('{"html":"<script>bad()</script>"}');});
  reject(v=>{v.images[0].size=4*1024*1024;});
  reject(v=>{v.images[0].type='image/svg+xml';});
  reject(v=>{v.project.pages[0].data.content[0].props.hidden=true;});
});
test('new composition fields cannot inject variants and comparison keeps its two-image contract',async()=>{
  for (let i=6;i<publishedTemplates.length;i++) {
    const {body}=await templateFixture(i,false);
    const hero=body.project.pages[0].data.content.find(b=>b.type==='DesignHero')!;
    const original=hero.props.variant;
    hero.props.variant='javascript:bad';
    assert.throws(()=>validateTemplateLead(body));hero.props.variant=original;
    const form=body.project.pages[0].data.content.find(b=>b.type==='DesignContact')!;
    form.props.formVariant='external';assert.throws(()=>validateTemplateLead(body));
  }
  const {body}=await templateFixture(publishedTemplates.findIndex(t=>t.slug==='car-detailing'),false);
  body.project.pages[0].data.content.find(b=>b.props.layout==='comparison')!.props.items.pop();
  assert.throws(()=>validateTemplateLead(body));
});
test('gallery media follows the same portable asset contract and cannot introduce external tracking',async()=>{
  for (const slug of ['photographer','holiday-lodge']) {
    const {body}=await templateFixture(publishedTemplates.findIndex(t=>t.slug===slug));
    const gallery=body.project.pages[0].data.content.find(b=>b.props.layout==='gallery')!;
    const upload=body.project.pages[0].data.content.find(b=>b.type==='DesignHero')!.props.image;
    assert.ok(gallery.props.items.length>=3);
    gallery.props.items[0].image=upload;
    gallery.props.hidden=true;
    const saved=validateTemplateLead(body);
    assert.equal(saved.project.pages[0].data.content.find((b:{props:{id:string}})=>b.props.id===gallery.props.id).props.items[0].image,upload);
    gallery.props.items[0].image='https://untrusted.invalid/track.jpg';
    assert.throws(()=>validateTemplateLead(body));
  }
});

test('real isolated Redis: consent → images → atomic lead → dedup → authenticated owner replay',async t=>{
  const h=await createTemplateHarness(t);if(!h)return;
  const f=await templateFixture();
  const post=async(body:unknown,query={},secret=f.secret)=>{
    const response=capture();await handleTemplateLead({method:'POST',body,query,headers:{'x-template-submission-key':secret}},response,h.options);return response;
  };
  // Bound visitor history retained; this is an isolated socket, never production.
  await trackVisitorEvent({event:'session_start',visitorId:f.body.visitorId,sessionId:f.body.visitorSessionId,eventId:'event-'+randomUUID(),path:'/',source:'telegram-qa',deviceType:'desktop',deviceFamily:'Mac',browser:'Chrome',referrerHost:''},h.options);
  h.telegram.length=0;
  const prepared=await post(f.body);assert.equal(prepared.statusCode,200);assert.equal(prepared.json().prepared,true);
  const repeat=await post(f.body);assert.equal(repeat.json().reference,prepared.json().reference);
  assert.equal((await post({...f.body,contact:{...f.body.contact,comment:'other'}})).statusCode,409);
  assert.equal((await post(f.body,{},'a'.repeat(64))).statusCode,401);
  const finalize={source:'template-catalog',action:'finalize',submissionId:f.body.submissionId};
  assert.equal((await post(finalize)).statusCode,409);
  const query={action:'upload',submissionId:f.body.submissionId,assetId:f.body.images[0].id};
  assert.equal((await post(Buffer.from('wrong'),query)).statusCode,400);
  assert.equal((await post(f.image,{...query,assetId:'asset-other-test'})).statusCode,400);
  assert.equal((await post(f.image,query)).statusCode,200);
  assert.equal((await post(f.image,query)).json().deduplicated,true);assert.equal(h.writes,1);
  const [a,b]=await Promise.all([post(finalize),post(finalize)]);
  assert.deepEqual([a.statusCode,b.statusCode].sort(),[200,201]);
  const ids=await h.command(['LRANGE','sitevl:ai-leads:index','0','-1']);assert.equal(ids.length,1);
  const lead=await readTemplateLead(ids[0],h.options);
  assert.equal(lead.source,'template-catalog');assert.equal(lead.project.assets[0].type,'image/webp');
  assert.equal(lead.attribution.basis,'visitor-session');assert.equal(lead.attribution.source,'telegram-qa');
  assert.equal(h.telegram.length,1);assert.ok(h.telegram[0].includes('/templates/owner/'+lead.id));
  assert.ok(!h.telegram[0].includes('closed.invalid'));assert.ok(!h.telegram[0].includes('schemaVersion'));
  assert.ok(!JSON.stringify(lead).includes('data:image'));assert.ok(!JSON.stringify(lead).includes(f.secret));
  assert.equal((await post(f.body)).json().stored,true);
  const history=await readVisitor(f.body.visitorId,h.options);
  assert.equal(history.history.filter((e:{event:string})=>e.event==='lead_created').length,1);
  assert.equal(history.history.find((e:{event:string})=>e.event==='lead_created').path,'/templates/beauty-salon');
  const owner=createVisitorOwnerHandler(h.options);
  const get=async(query:object,auth='')=>{const r=capture();await owner({method:'GET',query,headers:{authorization:auth}},r);return r;};
  assert.equal((await get({view:'template-lead',leadId:lead.id})).statusCode,401);
  assert.equal((await get({view:'template-lead',leadId:lead.id},'Bearer wrong')).statusCode,401);
  const token='Bearer '+h.options.environment.VISITOR_OWNER_API_TOKEN;
  const saved=await get({view:'template-lead',leadId:lead.id},token);
  assert.equal(saved.statusCode,200);assert.deepEqual(saved.json().project,lead.project);
  assert.ok(!saved.bytes.toString().includes('closed.invalid'));
  const image=await get({view:'template-asset',leadId:lead.id,assetId:lead.images[0].id},token);
  assert.equal(image.statusCode,200);assert.equal(image.bytes.length,lead.images[0].size);
  assert.equal(createHash('sha256').update(image.bytes).digest('hex'),lead.images[0].sha256);
  assert.equal((await get({view:'template-asset',leadId:lead.id,assetId:'asset-another'},token)).statusCode,404);
  assert.equal((await get({view:'template-lead',leadId:randomUUID()},token)).statusCode,404);
  assert.equal((await get({view:'template-lead',leadId:lead.id})).statusCode,401); // after logout
});
test('file failure never becomes lead success; retention deletes only own expired prefix',async t=>{
  const h=await createTemplateHarness(t);if(!h)return;
  const f=await templateFixture();const headers={'x-template-submission-key':f.secret};
  const send=async(body:unknown,query={})=>{const r=capture();await handleTemplateLead({method:'POST',body,query,headers},r,h.options);return r;};
  assert.equal((await send(f.body)).statusCode,200);
  const write=h.options.files.write;h.options.files.write=async()=>{throw new Error('private store unavailable');};
  assert.equal((await send(f.image,{action:'upload',submissionId:f.body.submissionId,assetId:f.body.images[0].id})).statusCode,502);
  assert.equal(await h.command(['LLEN','sitevl:ai-leads:index']),0);
  h.options.files.write=write;
  const own=`template-leads/${f.body.submissionId}/${f.body.images[0].id}.webp`;
  const other=`template-leads/${randomUUID()}/preserve.webp`;
  h.blobs.set(own,Buffer.from('expired'));h.blobs.set(other,Buffer.from('preserve'));h.blobs.set('other-project/preserve',Buffer.from('preserve'));
  await h.command(['ZADD','sitevl:ai-leads:template-expiry','1',f.body.submissionId]);
  await h.command(['SET','sitevl:lab:preserve','yes']);
  await cleanupTemplateUploads(h.options);
  assert.ok(!h.blobs.has(own));assert.ok(h.blobs.has(other));assert.ok(h.blobs.has('other-project/preserve'));
  assert.equal(await h.command(['GET','sitevl:lab:preserve']),'yes');
});
test('configuration is fail-closed, private route is noindex, no server libraries in client imports',async()=>{
  assert.equal(templateLeadConfiguration({}).configured,false);
  const config=JSON.parse(await readFile('vercel.json','utf8'));
  assert.ok(config.headers.some((r:{source:string})=>r.source==='/templates/owner/:path*'));
  const client=await readFile('src/features/site-builder/leads/client.ts','utf8');
  assert.ok(!/@vercel\/blob|BLOB_READ_WRITE_TOKEN|VISITOR_OWNER_API_TOKEN|TELEGRAM_BOT_TOKEN|Gemini/.test(client));
});

test('missing configuration reports booleans without contacting storage or exposing credentials',async()=>{
  let calls=0;
  const environment={KV_REST_API_URL:'https://isolated.invalid',KV_REST_API_TOKEN:'test-only-redis'};
  const config=templateLeadConfiguration(environment);
  assert.deepEqual(config,{configured:false,storageConfigured:true,filesConfigured:false,blobConfigured:false,ownerConfigured:false});
  const response=capture();
  await handleTemplateLead({method:'POST',body:{source:'template-catalog'}},response,{environment,fetchImpl:async()=>{calls++;throw new Error('must not call');}});
  assert.equal(response.statusCode,503);assert.equal(response.json().configured,false);assert.equal(calls,0);
  assert.ok(!response.bytes.toString().includes(environment.KV_REST_API_TOKEN));
  const owner=capture();
  await createVisitorOwnerHandler({environment})({method:'GET',headers:{authorization:'Bearer test'},query:{view:'template-lead'}},owner);
  assert.equal(owner.statusCode,404);
  const ready=templateLeadConfiguration({...environment,BLOB_READ_WRITE_TOKEN:'test-only-blob',VISITOR_OWNER_API_TOKEN:'test-only-owner'});
  assert.equal(ready.configured,true);assert.equal(ready.blobConfigured,true);
});

test('owner authentication requires an exact Bearer value; no normalization or truncation',()=>{
  const environment={VISITOR_OWNER_API_TOKEN:'test-only-owner'};
  assert.equal(authorizeOwnerRequest('Bearer test-only-owner',environment),true);
  for(const value of [undefined,'test-only-owner','Basic test-only-owner','Bearer wrong','Bearer test-only-owner extra','Bearer test-only-owner\n']) {
    assert.equal(authorizeOwnerRequest(value,environment),false);
  }
});

test('Redis failure is controlled, does not upload files, and never returns success or internal errors',async()=>{
  const fixture=await templateFixture();let uploads=0;
  const response=capture();
  await handleTemplateLead({method:'POST',body:fixture.body,headers:{'x-template-submission-key':fixture.secret}},response,{
    environment:{KV_REST_API_URL:'https://isolated.invalid',KV_REST_API_TOKEN:'test-only-redis',BLOB_READ_WRITE_TOKEN:'test-only-blob',VISITOR_OWNER_API_TOKEN:'test-only-owner'},
    fetchImpl:async()=>{throw new Error('PRIVATE_INTERNAL_REDIS_ERROR');},
    files:{write:async()=>{uploads++;}},
  });
  assert.equal(response.statusCode,502);assert.equal(uploads,0);assert.equal(response.json().stored,undefined);
  assert.ok(!response.bytes.toString().includes('PRIVATE_INTERNAL_REDIS_ERROR'));
});

test('actual image decoder rejects disguised SVG even with the correct upload hash',async()=>{
  const bytes=Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"><rect width="20" height="20"/></svg>');
  await assert.rejects(()=>normalizeTemplateImage(bytes,{size:bytes.length,type:'image/png',sha256:createHash('sha256').update(bytes).digest('hex')}));
});

test('private Blob adapter refuses broad cleanup and path injection before any SDK call',async()=>{
  const files=privateTemplateFiles({});
  for(const path of ['', '/', 'template-leads/', 'other-project/', `template-leads/${randomUUID()}/../`, 'https://example.test/image.webp']) {
    await assert.rejects(()=>files.removePrefix(path));
    await assert.rejects(()=>files.read(path));
    await assert.rejects(()=>files.write(path,Buffer.from('test')));
  }
  await assert.rejects(()=>files.read(`template-leads/${randomUUID()}/asset-example.webp`),{status:503});
});
test('new submission rate limit is durable; retries remain idempotent and Telegram failure does not lose data',async t=>{
  const h=await createTemplateHarness(t);if(!h)return;
  const f=await templateFixture(1,false);const headers={'x-template-submission-key':f.secret};
  const send=async(body:unknown,options=h.options)=>{const r=capture();await handleTemplateLead({method:'POST',body,headers},r,options);return r;};
  const missing=await send(f.body,{...h.options,environment:{...h.options.environment,BLOB_READ_WRITE_TOKEN:''}});
  assert.equal(missing.statusCode,503);assert.equal(await h.command(['LLEN','sitevl:ai-leads:index']),0);
  assert.equal((await send(f.body)).statusCode,200);
  for(let i=0;i<4;i++)assert.equal((await send({...f.body,submissionId:randomUUID()})).statusCode,200);
  assert.equal((await send({...f.body,submissionId:randomUUID()})).statusCode,429);
  assert.equal((await send(f.body)).statusCode,200);
  const failing={...h.options,fetchImpl:async(input:string|URL|Request,init?:RequestInit)=>String(input).includes('api.telegram.org')?Response.json({ok:false},{status:503}):h.options.fetchImpl(input,init)};
  const result=await send({source:'template-catalog',action:'finalize',submissionId:f.body.submissionId},failing);
  assert.equal(result.statusCode,201);assert.equal(result.json().stored,true);assert.equal(result.json().notification,'failed');
  assert.equal(result.json().telegramNotification,false);
  const storedIds=await h.command(['LRANGE','sitevl:ai-leads:index','0','0']) as string[];
  assert.equal(JSON.parse(await h.command(['GET',`sitevl:ai-lead:${storedIds[0]}`]) as string).telegramNotification,false);
  assert.equal(await h.command(['LLEN','sitevl:ai-leads:index']),1);
  const notificationsBeforeRetry=h.telegram.length;
  assert.equal((await send({source:'template-catalog',action:'finalize',submissionId:f.body.submissionId})).json().deduplicated,true);
  assert.equal(h.telegram.length,notificationsBeforeRetry);
});
