// Build-time asset preparation, never run in the browser. Pexels License: https://www.pexels.com/license/
import fs from 'node:fs/promises';
import sharp from 'sharp';
const photos = {market:1656663,apples:209439,tomatoes:533280,cucumbers:2329440,bananas:1093038,strawberries:934066,cherries:109274,potatoes:10112133,mandarins:207085,walnuts:33811984,almonds:1013420,rice:4110251,buckwheat:6810963,herbs:1309426,grapes:708777,peaches:2253550,watermelon:1313267,apricots:10112100};
await fs.mkdir('public/preview-grocery/photos',{recursive:true});
for(const [name,id]of Object.entries(photos)) {
 const file=`public/preview-grocery/photos/${name}.webp`;
 try {await fs.access(file);if(!process.argv.slice(2).includes(name))continue;}catch{/* new asset */}
 const response=await fetch(`https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=1400`,{signal:AbortSignal.timeout(30000)});
 if(!response.ok)throw new Error(`Photo ${name}: HTTP ${response.status}`);
 await sharp(Buffer.from(await response.arrayBuffer())).rotate().resize({width:name==='market'?1600:900,withoutEnlargement:true}).webp({quality:82}).toFile(file);
 console.log(`Prepared ${name}`);
}
await fs.writeFile('public/preview-grocery/photo-sources.json',JSON.stringify(Object.fromEntries(Object.entries(photos).map(([n,id])=>[n,{source:`https://www.pexels.com/photo/${id}/`,license:'https://www.pexels.com/license/'}])),null,2)+'\n');
