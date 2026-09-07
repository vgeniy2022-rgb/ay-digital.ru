// Deterministic format conversion of the existing SITEVL vector marks.
// The generated files are committed; sharp is only needed to regenerate them,
// not to build or serve the website. Set SITEVL_SHARP_MODULE to an installed
// sharp module if it is not available through the normal Node resolution.
import { createRequire } from 'node:module';
import { readFile, writeFile } from 'node:fs/promises';

const require = createRequire(import.meta.url);
const sharp = require(process.env.SITEVL_SHARP_MODULE || 'sharp');
const asset = (name) => new URL(`../public/${name}`, import.meta.url);
const favicon = await readFile(asset('favicon.svg'));
const touchIcon = await readFile(asset('apple-touch-icon.svg'));

async function png(source, size, sourceSize = 64) {
  // Render the vector at the target resolution, never upscale a bitmap.
  return sharp(source, { density: 72 * size / sourceSize })
    .resize(size, size).png({ compressionLevel: 9 }).toBuffer();
}

for (const size of [48, 96, 192, 512]) {
  await writeFile(asset(`favicon-${size}x${size}.png`), await png(favicon, size));
}
await writeFile(asset('apple-touch-icon.png'), await png(touchIcon, 180, 180));

// Standard ICO directory with independent PNG-compressed 32-bit frames.
const sizes = [16, 32, 48];
const frames = await Promise.all(sizes.map((size) => png(favicon, size)));
const directory = Buffer.alloc(6 + 16 * frames.length);
directory.writeUInt16LE(1, 2);
directory.writeUInt16LE(frames.length, 4);
let offset = directory.length;
for (const [index, frame] of frames.entries()) {
  const entry = 6 + 16 * index;
  directory[entry] = sizes[index];
  directory[entry + 1] = sizes[index];
  directory.writeUInt16LE(1, entry + 4);
  directory.writeUInt16LE(32, entry + 6);
  directory.writeUInt32LE(frame.length, entry + 8);
  directory.writeUInt32LE(offset, entry + 12);
  offset += frame.length;
}
await writeFile(asset('favicon.ico'), Buffer.concat([directory, ...frames]));
console.log('[branding-assets] Generated ICO (16/32/48), PNG (48/96/192/512) and Apple touch PNG (180). Existing SVG sources unchanged.');
