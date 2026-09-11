import { randomUUID, timingSafeEqual } from 'node:crypto';
import { redisPipeline, isLabStatsStorageConfigured } from './_labStatsCore.mjs';
import { sendTelegram, linkLeadToVisitor, readVisitor } from './_visitorIntelligenceCore.mjs';
import { requestAttribution, trustedRequestIp } from './_trafficPolicyV3.mjs';
import { PUBLIC_SITE_ORIGIN } from '../src/config/publicOrigin.mjs';
import { privateTemplateFiles, normalizeTemplateImage } from './_templatePrivateFiles.mjs';
import { validateTemplateLead, uuidPattern, assetPattern, digest, requireThat, TemplateError, MAX_IMAGE_BYTES } from './_templateLeadValidation.mjs';
import { templateContract } from './_templateContract.generated.mjs';

const pendingKey = id => `sitevl:ai-leads:template-upload:${id}`;
const expiryKey = 'sitevl:ai-leads:template-expiry';
const prefix = id => `template-leads/${id}/`;
const PENDING_TTL = 86400;
const nowOf = options => options.now ? options.now() : Date.now();
const run = async (commands, options) => (await redisPipeline(commands, options)).map(entry => entry.result);
export function templateLeadConfiguration(environment = process.env) {
  const storageConfigured = isLabStatsStorageConfigured(environment);
  const filesConfigured = Boolean(environment.BLOB_READ_WRITE_TOKEN);
  const ownerConfigured = Boolean(environment.VISITOR_OWNER_API_TOKEN);
  return { configured: storageConfigured && filesConfigured && ownerConfigured, storageConfigured, filesConfigured, blobConfigured: filesConfigured, ownerConfigured };
}
export function templateJson(response, status, body) {
  response.statusCode = status;
  response.setHeader('Content-Type','application/json; charset=utf-8');
  response.setHeader('Cache-Control','no-store');
  response.setHeader('X-Content-Type-Options','nosniff');
  response.setHeader('X-Robots-Tag','noindex, nofollow');
  response.end(JSON.stringify(body));
}
function submissionSecret(request) {
  const secret = request.headers?.['x-template-submission-key'];
  requireThat(typeof secret === 'string' && /^[a-f0-9]{64}$/.test(secret), 'Не удалось подтвердить отправку.', 401);
  return digest(secret);
}
async function pending(id, secretHash, options) {
  requireThat(uuidPattern.test(id || ''));
  const [raw] = await run([['HGET',pendingKey(id),'record']],options);
  requireThat(raw, 'Срок отправки истёк. Откройте форму заново; черновик сохранён.', 410);
  const record = JSON.parse(raw);
  requireThat(timingSafeEqual(Buffer.from(record.secretHash),Buffer.from(secretHash)), 'Не удалось подтвердить отправку.', 401);
  return record;
}
const PREPARE = `
if redis.call('EXISTS',KEYS[3]) == 1 then return '' end
if redis.call('EXISTS',KEYS[1]) == 1 then return redis.call('HGET',KEYS[1],'record') end
redis.call('HSET',KEYS[1],'record',ARGV[1]); redis.call('EXPIRE',KEYS[1],ARGV[2])
redis.call('ZADD',KEYS[2],ARGV[3],ARGV[4]); return ARGV[1]`;
const FINALIZE = `
if redis.call('HGET',KEYS[1],'record') ~= ARGV[1] then return 'expired' end
if redis.call('HGET',KEYS[1],'stored') then return 'duplicate' end
redis.call('SET',KEYS[2],ARGV[2],'EX',ARGV[3])
redis.call('LPUSH',KEYS[3],ARGV[4]); redis.call('LTRIM',KEYS[3],0,999); redis.call('EXPIRE',KEYS[3],ARGV[3])
redis.call('HSET',KEYS[1],'stored','1'); redis.call('EXPIRE',KEYS[1],ARGV[3])
redis.call('ZADD',KEYS[4],ARGV[5],ARGV[6]); return 'stored'`;

/** Bounded opportunistic retention; never scans/deletes other Blob prefixes or Redis namespaces. */
export async function cleanupTemplateUploads(options = {}) {
  const files = options.files || privateTemplateFiles(options.environment);
  const [ids] = await run([['ZRANGEBYSCORE',expiryKey,'-inf',String(nowOf(options)),'LIMIT','0','2']],options);
  for (const id of ids || []) {
    if (!uuidPattern.test(id)) continue;
    const [lock] = await run([['SET',`${pendingKey(id)}:cleanup`,'1','NX','EX','120']],options);
    if (lock !== 'OK') continue;
    try {
      // Recheck after locking: a completed/retried upload may have extended retention.
      const [score] = await run([['ZSCORE',expiryKey,id]],options);
      if (!score || Number(score)>nowOf(options)) continue;
      await files.removePrefix(prefix(id));
      await run([['ZREM',expiryKey,id],['DEL',pendingKey(id)]],options);
    } finally { await run([['DEL',`${pendingKey(id)}:cleanup`]],options); }
  }
}
async function attributionFor(request, value, options) {
  const verified = requestAttribution(request,options.environment,nowOf(options));
  if (verified) return { basis:'signed-ad-cookie', source:verified.source, campaign:verified.campaign || '', sourceTag:verified.sourceTag || '', campaignTag:verified.campaignTag || '', entryHost:verified.entryHost, paid:verified.paid === true };
  if (value.visitorId && value.visitorSessionId) {
    const history = await readVisitor(value.visitorId,{...options,sessionId:value.visitorSessionId}).catch(()=>null);
    if (history?.session?.source) return {basis:'visitor-session',source:history.session.source,firstSource:history.visitor?.firstSource || ''};
  }
  return {basis:value.sourceTag ? 'browser-tag-unverified' : 'unknown',source:value.sourceTag || ''};
}
export function buildTemplateTelegramSummary(lead) {
  return ['🚀 Заявка SITEVL · каталог дизайнов',lead.reference,
    `Дизайн: ${lead.template.name} · ${lead.template.version}`,`Компания: ${lead.project.name}`,
    `Имя: ${lead.contact.name}`,`Контакт: ${lead.contact.contact}`,
    `Пакет: ${lead.package.name} · ${lead.package.price} (ориентир)`,
    `Бюджет: ${lead.contact.budget || 'не указан'}`,`Срок: ${lead.contact.deadline || 'не указан'}`,
    `Пожелания: ${lead.contact.comment.slice(0,500) || 'не указаны'}`,
    `Visitor: ${lead.visitorId || 'нет'} · Источник: ${lead.attribution.source || 'не определён'}`,
    `Фото: ${lead.images.length}`,`Сохранённый сайт (нужен доступ владельца):\n${PUBLIC_SITE_ORIGIN}/templates/owner/${lead.id}`,
    new Date(lead.createdAt).toLocaleString('ru-RU',{timeZone:'Asia/Vladivostok'})+' · Владивосток'].join('\n').slice(0,2400);
}
async function notify(lead, options) {
  return (await sendTelegram(buildTemplateTelegramSummary(lead), options)).status;
}
export async function handleTemplateLead(request, response, options = {}) {
  const environment = options.environment || process.env;
  const files = options.files || privateTemplateFiles(environment);
  try {
    requireThat(request.method === 'POST','Метод не поддерживается.',405);
    const configuration = templateLeadConfiguration(environment);
    if (!configuration.configured) return templateJson(response,503,{...configuration,error:'Приём проектов пока не настроен: нужны закрытое хранилище файлов, Redis и доступ владельца. Черновик остаётся в браузере.'});
    const secretHash = submissionSecret(request);
    const body = request.body;
    const action = request.query?.action || body?.action;
    const id = request.query?.submissionId || body?.submissionId;
    requireThat(uuidPattern.test(id || ''));
    if (action === 'prepare') {
      const value = validateTemplateLead(body);
      // Prices are server-owned and may change between a retry and a release.
      const fingerprint = digest(JSON.stringify({...value,package:undefined}));
      const [existing] = await run([['HGET',pendingKey(id),'record']],options);
      if (existing) {
        const old = await pending(id,secretHash,options);
        requireThat(old.fingerprint === fingerprint,'Данные изменились. Создайте новую отправку.',409);
        const [stored] = await run([['HGET',pendingKey(id),'stored']],options);
        return templateJson(response,200,{prepared:true,stored:Boolean(stored),reference:old.lead.reference,package:old.lead.package});
      }
      const ipHash = digest(trustedRequestIp(request,environment) || 'shared-local');
      const [rate, ,total] = await run([['INCR',`sitevl:ai-lead-rate:template:${ipHash}`],['EXPIRE',`sitevl:ai-lead-rate:template:${ipHash}`,'1800'],['INCR','sitevl:ai-lead-rate:template:global'],['EXPIRE','sitevl:ai-lead-rate:template:global','86400']],options);
      requireThat(rate <= 5 && total <= 100,'Слишком много отправок. Попробуйте позже.',429);
      await cleanupTemplateUploads(options).catch(()=>{});
      const leadId = randomUUID(), now = nowOf(options);
      const lead = {...value,id:leadId,reference:'SV-TPL-'+leadId.replace(/-/g,'').slice(0,8).toUpperCase(),createdAt:new Date(now).toISOString(),attribution:await attributionFor(request,value,options)};
      lead.conceptId = lead.reference; // Compatible visitor linkage, reference is explicitly a template, not AI.
      const record = {secretHash,fingerprint,lead};
      const [saved] = await run([['EVAL',PREPARE,'3',pendingKey(id),expiryKey,`${pendingKey(id)}:cleanup`,JSON.stringify(record),String(PENDING_TTL),String(now+(PENDING_TTL+3600)*1000),id]],options);
      requireThat(saved,'Срок старой отправки истёк. Повторите через минуту; черновик сохранён.',409);
      const accepted = JSON.parse(saved);
      requireThat(accepted.secretHash === secretHash && accepted.fingerprint === fingerprint,'Другая отправка уже использует этот номер.',409);
      return templateJson(response,200,{prepared:true,reference:accepted.lead.reference,package:accepted.lead.package});
    }
    const record = await pending(id,secretHash,options);
    const [stored] = await run([['HGET',pendingKey(id),'stored']],options);
    if (action === 'upload') {
      requireThat(!stored,'Эта заявка уже сохранена.',409);
      const assetId = request.query?.assetId;
      const manifest = record.lead.images.find(a => a.id === assetId);
      requireThat(manifest && assetPattern.test(assetId));
      const [already] = await run([['HGET',pendingKey(id),`asset:${assetId}`]],options);
      if (already) return templateJson(response,200,{uploaded:true,deduplicated:true});
      const bytes = await readImageBody(request);
      const normalized = await normalizeTemplateImage(bytes,manifest);
      const {bytes:content,...metadata} = normalized;
      const location = await files.write(`${prefix(id)}${assetId}.webp`,content);
      // Never resurrect an expired pending record.
      const [saved] = await run([['EVAL',"if redis.call('EXISTS',KEYS[1]) == 0 then return -1 end return redis.call('HSET',KEYS[1],ARGV[1],ARGV[2])",'1',pendingKey(id),`asset:${assetId}`,JSON.stringify({...manifest,...metadata,...location})]],options);
      requireThat(saved !== -1,'Срок загрузки истёк.',410);
      return templateJson(response,200,{uploaded:true});
    }
    requireThat(action === 'finalize');
    if (stored) return templateJson(response,200,{stored:true,deduplicated:true,reference:record.lead.reference});
    const uploads = record.lead.images.length ? await run(record.lead.images.map(a => ['HGET',pendingKey(id),`asset:${a.id}`]),options) : [];
    requireThat(uploads.every(Boolean),'Не все фотографии сохранены. Повторите отправку.',409);
    const lead = {...structuredClone(record.lead),images:uploads.map(JSON.parse)};
    lead.project.assets = lead.project.assets.map(asset => { const image = lead.images.find(i=>i.id===asset.id);return {...asset,name:asset.id+'.webp',type:image.type,size:image.size,width:image.width,height:image.height}; });
    const days = Math.min(365,Math.max(7,Math.round(Number(environment.AI_LEADS_RETENTION_DAYS)||90)));
    lead.retentionDays = days;
    // Persistence is the success boundary; Telegram is an optional channel.
    lead.telegramNotification = false;
    lead.package = templateContract.find(t=>t.id===lead.template.id && t.version===lead.template.version).package;
    lead.priceConfirmedAt = new Date(nowOf(options)).toISOString();
    const [result] = await run([['EVAL',FINALIZE,'4',pendingKey(id),`sitevl:ai-lead:${lead.id}`,'sitevl:ai-leads:index',expiryKey,JSON.stringify(record),JSON.stringify(lead),String(days*86400),lead.id,String(nowOf(options)+(days*86400+3600)*1000),id]],options);
    requireThat(result !== 'expired','Отправка истекла. Черновик сохранён.',410);
    let notification = 'skipped';
    if (result === 'stored') {
      await linkLeadToVisitor(lead,{...options,notify:false,leadPath:`/templates/${lead.template.slug}`}).catch(()=>{});
      notification = await notify(lead,options).catch(()=>'failed');
      if (notification === 'sent') {
        lead.telegramNotification = true;
        await run([['SET',`sitevl:ai-lead:${lead.id}`,JSON.stringify(lead),'XX','KEEPTTL']],options).catch(()=>{});
      }
      await run([['SET',`sitevl:ai-leads:template-notification:${lead.id}`,notification,'EX',String(days*86400)]],options).catch(()=>{});
    }
    return templateJson(response,result === 'stored' ? 201 : 200,{stored:true,deduplicated:result === 'duplicate',reference:lead.reference,retentionDays:days,notification,telegramNotification:notification === 'sent'});
  } catch(error) {
    return templateJson(response,error instanceof TemplateError ? error.status : 502,{error:error instanceof TemplateError ? error.message : 'Не удалось надёжно сохранить проект. Черновик не потерян: повторите отправку.'});
  }
}
async function readImageBody(request) {
  requireThat(Number(request.headers?.['content-length'] || 0) <= MAX_IMAGE_BYTES,'Файл превышает 3 МБ.',413);
  if (Buffer.isBuffer(request.body)) return request.body;
  const chunks=[];let size=0;
  for await (const chunk of request) { size+=chunk.length;requireThat(size<=MAX_IMAGE_BYTES,'Файл превышает 3 МБ.',413);chunks.push(chunk); }
  return Buffer.concat(chunks);
}
export async function readTemplateLead(id,options = {}) {
  requireThat(uuidPattern.test(id || ''),'Ресурс не найден.',404);
  const [raw] = await run([['GET',`sitevl:ai-lead:${id}`]],options);
  requireThat(raw,'Ресурс не найден или срок хранения истёк.',404);
  const lead=JSON.parse(raw);
  requireThat(lead.source === 'template-catalog','Ресурс не найден.',404);
  return lead;
}
export async function handleTemplateOwner(request,response,options = {}) {
  try {
    const lead = await readTemplateLead(request.query?.leadId,options);
    if (request.query?.view === 'template-lead') {
      const images = lead.images.map(({id,type,size,sha256})=>({id,type,size,sha256}));
      return templateJson(response,200,{...lead,images});
    }
    const image = lead.images.find(a=>a.id===request.query?.assetId);
    requireThat(image,'Файл не найден.',404);
    const bytes=await (options.files || privateTemplateFiles(options.environment)).read(image.path);
    requireThat(bytes && digest(bytes)===image.sha256,'Файл временно недоступен.',502);
    response.statusCode=200;response.setHeader('Content-Type','image/webp');response.setHeader('Content-Length',bytes.length);
    response.setHeader('Cache-Control','no-store');response.setHeader('X-Content-Type-Options','nosniff');response.setHeader('X-Robots-Tag','noindex');response.end(bytes);
  } catch(error) { return templateJson(response,error instanceof TemplateError ? error.status : 502,{error:error instanceof TemplateError ? error.message : 'Не удалось открыть сохранённый проект.'}); }
}
