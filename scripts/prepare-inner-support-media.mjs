// Mechanical optimisation only: no cropping, retouching or generated interface.
// Pass the six real PNG captures in the order below. Never pass the settings
// screenshot: it contains partially visible administrative connection values.
import { createRequire } from 'node:module';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const require = createRequire(import.meta.url);
const sharp = require(process.env.SITEVL_SHARP_MODULE || 'sharp');
const names = ['site-desktop', 'site-topics', 'site-mobile', 'app-lectures', 'app-literature', 'app-diagnostics'];
const inputs = process.argv.slice(2);
if (inputs.length !== names.length) throw new Error(`Expected PNG files: ${names.join(', ')}`);
const output = resolve('public/cases/inner-support-school');
await mkdir(output, { recursive: true });
for (const [index, name] of names.entries()) {
  const meta = await sharp(inputs[index]).metadata();
  const widths = name.startsWith('app-') ? [440, 880, 1320] : name === 'site-mobile' ? [390] : [720, 1440];
  for (const width of widths) {
    const result = await sharp(inputs[index]).resize({ width, withoutEnlargement: true })
      .webp({ quality: 86, effort: 6 }).toFile(resolve(output, `${name}-${width}.webp`));
    console.log(JSON.stringify({ name, width: result.width, height: result.height, bytes: result.size, originalWidth: meta.width, originalHeight: meta.height }));
  }
}
