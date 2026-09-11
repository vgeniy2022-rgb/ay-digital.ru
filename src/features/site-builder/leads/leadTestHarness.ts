import type { TestContext } from 'node:test';
import { randomUUID, createHash } from 'node:crypto';
import sharp from 'sharp';
import { createRedisHarness } from '../../site-analytics/visitorRedisHarness';
import { publishedTemplates, createProjectFromCatalog } from '../catalog/catalog';
import { loadTemplateProject } from '../catalog/projectLoaders';
import { enableCustomizer } from '../customizer/model';

export function capture() {
  let bytes=Buffer.alloc(0);
  return {statusCode:200,headers:{} as Record<string,string>,
    setHeader(key:string,value:string|number){this.headers[key]=String(value);},end(value:string|Buffer){bytes=Buffer.from(value);},
    get bytes(){return bytes;},json(){return JSON.parse(bytes.toString());}};
}
export async function templateFixture(index=0, withImage=true) {
  const template=await loadTemplateProject(publishedTemplates[index]);
  const project=enableCustomizer(createProjectFromCatalog(template),template.version);
  const image=await sharp({create:{width:32,height:24,channels:3,background:'#345678'}}).png().toBuffer();
  const id='asset-'+randomUUID();
  const images=withImage?[{id,size:image.length,type:'image/png',sha256:createHash('sha256').update(image).digest('hex')}]:[];
  if(withImage) {
    project.assets=[{id,projectId:project.id,name:'qa.png',type:'image/png',size:image.length,alt:'QA image',focalPoint:{x:50,y:50},createdAt:project.createdAt}];
    project.pages[0].data.content.find(b=>b.type==='DesignHero')!.props.image='asset://'+id;
  }
  return {image,body:{source:'template-catalog',action:'prepare',submissionId:randomUUID(),template:{id:template.id,version:template.version},project,images,
    contact:{name:'Изолированный QA',contact:'qa@example.test',comment:'Без внешней отправки',budget:'',deadline:'',consent:true},visitorId:'SV-AABBCC',visitorSessionId:'session-'+randomUUID(),sourceTag:'telegram-qa'},secret:'c'.repeat(64)};
}
export async function createTemplateHarness(t:TestContext) {
  const redis=await createRedisHarness(t);if(!redis)return null;
  const blobs=new Map<string,Buffer>();let writes=0;
  const files={async write(path:string,bytes:Buffer){blobs.set(path,Buffer.from(bytes));writes++;return {path,url:'https://closed.invalid/'+path};},
    async read(path:string){return blobs.get(path)||null;},async removePrefix(prefix:string){for(const path of blobs.keys())if(path.startsWith(prefix))blobs.delete(path);}};
  const options={...redis.options,environment:{...redis.options.environment,BLOB_READ_WRITE_TOKEN:'test-private-store',VISITOR_OWNER_API_TOKEN:'test-owner-key'},files,now:()=>Date.now()};
  return {...redis,blobs,options,get writes(){return writes;}};
}
