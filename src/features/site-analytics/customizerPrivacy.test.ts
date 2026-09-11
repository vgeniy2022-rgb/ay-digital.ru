import test from 'node:test';
import assert from 'node:assert/strict';
import { trackVisitorPage, trackVisitorBehavior, ensureVisitorSession } from './visitorIntelligence';

test('private design draft paths never reach the visitor endpoint; public analytics still works',async t=>{
 const calls:RequestInit[]=[];
 t.mock.method(globalThis,'fetch',async(_url:unknown,init:RequestInit)=>{calls.push(init);return Response.json({accepted:true});});
 const storage=()=>{const map=new Map<string,string>();return {getItem:(key:string)=>map.get(key)||null,setItem:(key:string,value:string)=>{map.set(key,value);}};};
 const local=storage(),session=storage(),privatePath='/templates/customize/project-personal-test';
 await ensureVisitorSession(privatePath,'',local,session,'Safari','','localhost');
 await trackVisitorPage(privatePath,'test','',local,session,'Safari','','localhost');
 await trackVisitorBehavior(privatePath,{dwell:1,scroll:0,pointer:true,touch:false,keyboard:false,link:false,form:true},local,session);
 await trackVisitorPage('/templates/owner/qa-private-lead','test','',local,session,'Safari','','localhost');
 assert.equal(calls.length,0);
 await trackVisitorPage('/templates','public','',local,session,'Safari','','localhost');
 assert.equal(calls.length,2);
 assert.ok(calls.every(call=>!String(call.body).includes('project-personal-test')));
});
