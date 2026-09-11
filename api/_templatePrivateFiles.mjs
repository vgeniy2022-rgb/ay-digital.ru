import { put, get, list, del } from '@vercel/blob';
import sharp from 'sharp';
import { MAX_IMAGE_BYTES, requireThat, digest, uuidPattern, assetPattern } from './_templateLeadValidation.mjs';

function validatePrivatePath(path, isPrefix = false) {
  requireThat(typeof path === 'string');
  const parts = path.split('/');
  requireThat(parts.length === 3 && parts[0] === 'template-leads' && uuidPattern.test(parts[1]));
  requireThat(isPrefix ? parts[2] === '' : parts[2].endsWith('.webp') && assetPattern.test(parts[2].slice(0,-5)));
}

/** Server-only. No client upload tokens, public blobs, data URLs or arbitrary paths. */
export function privateTemplateFiles(environment = process.env) {
  const token = environment.BLOB_READ_WRITE_TOKEN;
  const read = async path => {
    validatePrivatePath(path);
    requireThat(token, 'Закрытое хранилище файлов пока не настроено.', 503);
    const result = await get(path, { access: 'private', token, useCache: false, abortSignal: AbortSignal.timeout(15000) });
    if (!result || result.statusCode !== 200) return null;
    requireThat(result.blob.size <= MAX_IMAGE_BYTES, 'Файл превышает лимит.', 413);
    return Buffer.from(await new Response(result.stream).arrayBuffer());
  };
  return {
    read,
    async write(path, bytes) {
      validatePrivatePath(path);
      requireThat(token, 'Закрытое хранилище файлов пока не настроено.', 503);
      try {
        const result = await put(path, bytes, { access: 'private', token, addRandomSuffix: false, allowOverwrite: false, contentType: 'image/webp', cacheControlMaxAge: 60, abortSignal: AbortSignal.timeout(15000) });
        return { path: result.pathname, url: result.url };
      } catch (error) {
        // A successful PUT whose response was lost is safely recoverable. Never overwrite.
        const previous = await read(path).catch(() => null);
        if (previous && digest(previous) === digest(bytes)) return { path };
        throw error;
      }
    },
    async removePrefix(prefix) {
      validatePrivatePath(prefix, true);
      requireThat(token, 'Закрытое хранилище файлов пока не настроено.', 503);
      const result = await list({ prefix, limit: 21, token, abortSignal: AbortSignal.timeout(10000) });
      requireThat(!result.hasMore && result.blobs.length <= 20, 'Проверка хранения не завершена.', 503);
      requireThat(result.blobs.every(blob => blob.pathname.startsWith(prefix)));
      if (result.blobs.length) await del(result.blobs.map(blob => blob.url), { token, abortSignal: AbortSignal.timeout(10000) });
    },
  };
}
export async function normalizeTemplateImage(bytes, manifest) {
  requireThat(Buffer.isBuffer(bytes) && bytes.length === manifest.size && bytes.length <= MAX_IMAGE_BYTES && digest(bytes) === manifest.sha256, 'Файл изменился или загружен не полностью.', 400);
  try {
    const image = sharp(bytes, { limitInputPixels: 32_000_000, animated: false });
    const metadata = await image.metadata();
    requireThat(['jpeg','png','webp','avif','heif'].includes(metadata.format) && (!metadata.pages || metadata.pages === 1));
    const {data,info} = await image.rotate().resize({ width:2200,height:2200,fit:'inside',withoutEnlargement:true }).webp({quality:84}).toBuffer({resolveWithObject:true});
    requireThat(data.length <= MAX_IMAGE_BYTES);
    return { bytes: data, size: info.size, width: info.width, height: info.height, sha256: digest(data), type:'image/webp' };
  } catch { requireThat(false, 'Не удалось проверить изображение. Используйте обычный JPG, PNG, WebP или AVIF.'); }
}
