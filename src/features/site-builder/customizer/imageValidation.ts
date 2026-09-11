export const CUSTOMIZER_FILE_LIMIT = 12 * 1024 * 1024;
export const CUSTOMIZER_ASSET_LIMIT = 20;
export const CUSTOMIZER_STORAGE_LIMIT = 40 * 1024 * 1024;
export function detectRasterType(bytes: Uint8Array) {
  const ascii = (start:number,end:number) => String.fromCharCode(...bytes.slice(start,end));
  if ([137,80,78,71,13,10,26,10].every((b,i)=>bytes[i]===b)) return 'image/png';
  if (bytes[0]===255 && bytes[1]===216 && bytes[2]===255) return 'image/jpeg';
  if (ascii(0,4)==='RIFF' && ascii(8,12)==='WEBP') return 'image/webp';
  if (ascii(4,8)==='ftyp' && ['avif','avis'].some(brand=>[8,16,20,24,28].some(i=>ascii(i,i+4)===brand))) return 'image/avif';
  return null;
}
export async function validateCustomizerImage(file: File) {
  if (!file.size || file.size > CUSTOMIZER_FILE_LIMIT) throw new Error('Выберите непустой файл размером до 12 МБ.');
  const format=detectRasterType(new Uint8Array(await file.slice(0,64).arrayBuffer()));
  if (!format || format!==file.type || !/\.(jpe?g|png|webp|avif)$/i.test(file.name)) throw new Error('Нужна настоящая фотография JPG, PNG, WebP или AVIF. SVG, GIF и переименованные файлы не поддерживаются.');
}
