import test from 'node:test';
import assert from 'node:assert/strict';
// @ts-expect-error Server MJS module.
import { sendTelegram } from '../../../../api/_visitorIntelligenceCore.mjs';
const environment={TELEGRAM_BOT_TOKEN:'test-server-credential',TELEGRAM_CHAT_ID:'test-private-chat'};
for(const status of [200,400,401,403,429]) {
  test(`Telegram ${status}: parse actual API response; never blindly retry`,async()=>{
    let calls=0;
    const result=await sendTelegram('QA',{environment,fetchImpl:async()=>{
      calls++;return Response.json(status===200?{ok:true,result:{message_id:17}}:{ok:false,error_code:status,description:'API rejected request'},{status});
    }});
    assert.equal(calls,1);assert.equal(result.status,status===200?'sent':'failed');
    assert.equal(result.diagnostic.httpStatus,status);assert.equal(result.diagnostic.ok,status===200);
    assert.equal(result.diagnostic.error_code,status===200?null:status);
  });
}
test('Telegram false success, malformed JSON, timeout and network are failures without duplicate sends',async()=>{
  for(const behavior of ['false-ok','malformed','timeout','network']) {
    let calls=0;
    const result=await sendTelegram('QA',{environment,fetchImpl:async()=>{
      calls++;
      if(behavior==='timeout')throw new DOMException('sensitive URL must not escape','TimeoutError');
      if(behavior==='network')throw new Error('sensitive URL must not escape');
      return behavior==='malformed'?new Response('not json'):Response.json({ok:false,error_code:400});
    }});
    assert.equal(result.status,'failed');assert.equal(calls,1);
    assert.ok(!JSON.stringify(result).includes('sensitive'));
    if(behavior!=='false-ok')assert.equal(result.diagnostic.failureType,behavior==='malformed'?'malformed-response':behavior);
  }
});
test('Plain text preserves user punctuation without enabling HTML or Markdown; bounded and redacted diagnostics',async()=>{
  const text='<b>Компания</b> _*[]() \\ & "'+ 'x'.repeat(4000);
  let body:Record<string,unknown>={};
  const result=await sendTelegram(text,{environment,fetchImpl:async(_url:string,init:RequestInit)=>{
    body=JSON.parse(String(init.body));return Response.json({ok:false,error_code:400,description:`${environment.TELEGRAM_BOT_TOKEN} ${environment.TELEGRAM_CHAT_ID} https://example.test/private`},{status:400});
  }});
  assert.equal(body.text,text.slice(0,3500));assert.ok(!('parse_mode' in body));
  assert.ok(!JSON.stringify(result).includes(environment.TELEGRAM_BOT_TOKEN));
  assert.ok(!JSON.stringify(result).includes(environment.TELEGRAM_CHAT_ID));
  assert.ok(!JSON.stringify(result).includes('https://'));
});
test('Missing Telegram configuration does not call network',async()=>{
  assert.equal((await sendTelegram('QA',{environment:{},fetchImpl:()=>{throw new Error('must not call');}})).status,'not-configured');
});
