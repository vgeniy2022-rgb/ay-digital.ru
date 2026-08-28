const acceptedImageTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);
const maxFileSize = 12 * 1024 * 1024;

export async function optimizeStudioImage(file: File) {
  if (!acceptedImageTypes.has(file.type)) throw new Error(`Файл «${file.name}» имеет неподдерживаемый формат.`);
  if (file.size > maxFileSize) throw new Error(`Файл «${file.name}» больше 12 МБ.`);

  const sourceUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error(`Не удалось прочитать «${file.name}».`));
      element.src = sourceUrl;
    });
    const maxSide = 2200;
    const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Браузер не смог подготовить изображение.');
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((value) => value ? resolve(value) : reject(new Error('Не удалось оптимизировать изображение.')), 'image/webp', 0.84));
    return { blob, width: canvas.width, height: canvas.height, type: blob.type };
  } finally {
    URL.revokeObjectURL(sourceUrl);
  }
}

