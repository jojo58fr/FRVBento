import type { ImageData } from '../types';

export const MAX_WIDTH = 1920;
export const MAX_HEIGHT = 1080;
export const MAX_FILE_BYTES = 1_500_000;
export const CHUNK_SIZE = 500_000;
export const MAX_TOTAL_BYTES = 5_000_000;

export const isImageData = (value: unknown): value is ImageData => {
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  return (
    (record.kind === 'data' && typeof record.dataUrl === 'string') ||
    (record.kind === 'chunked' &&
      typeof record.mime === 'string' &&
      Array.isArray(record.chunks) &&
      record.chunks.every((c) => typeof c === 'string'))
  );
};

export const resolveImageSrc = (
  value?: string | ImageData | null
): string | undefined => {
  if (!value) return undefined;
  if (typeof value === 'string') return value;
  return unchunkDataUrl(value);
};

export const getImageDataUrlLength = (value?: string | ImageData | null): number => {
  if (!value) return 0;
  if (typeof value === 'string') return value.length;
  if (value.kind === 'data') return value.dataUrl.length;
  const prefix = `data:${value.mime};base64,`;
  let total = prefix.length;
  for (const chunk of value.chunks) total += chunk.length;
  return total;
};

export const chunkDataUrl = (dataUrl: string): ImageData => {
  if (dataUrl.length <= MAX_FILE_BYTES) {
    return { kind: 'data', dataUrl };
  }

  const [prefix, base64] = dataUrl.split(',', 2);
  const chunks: string[] = [];

  for (let i = 0; i < base64.length; i += CHUNK_SIZE) {
    chunks.push(base64.slice(i, i + CHUNK_SIZE));
  }

  const mime = prefix.match(/^data:(.*?);base64$/)?.[1] ?? 'image/webp';
  return { kind: 'chunked', mime, chunks };
};

export const unchunkDataUrl = (img: ImageData): string => {
  if (img.kind === 'data') return img.dataUrl;
  return `data:${img.mime};base64,` + img.chunks.join('');
};

const fitWithin = (width: number, height: number, maxW: number, maxH: number) => {
  const scale = Math.min(maxW / width, maxH / height, 1);
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
    didResize: scale < 1,
  };
};

const loadImage = (dataUrl: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = dataUrl;
  });
};

export const normalizeImageToWebp = async (
  dataUrl: string
): Promise<{ dataUrl: string; didResize: boolean; didAdjustQuality: boolean }> => {
  if (!dataUrl.startsWith('data:image')) {
    throw new Error('Unsupported image format');
  }

  const img = await loadImage(dataUrl);
  const { width, height, didResize } = fitWithin(img.width, img.height, MAX_WIDTH, MAX_HEIGHT);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to prepare canvas');
  ctx.drawImage(img, 0, 0, width, height);

  let quality = 0.8;
  let webp = canvas.toDataURL('image/webp', quality);
  let didAdjustQuality = false;

  while (webp.length > MAX_FILE_BYTES && quality > 0.5) {
    quality = Math.max(0.5, Math.round((quality - 0.1) * 10) / 10);
    webp = canvas.toDataURL('image/webp', quality);
    didAdjustQuality = true;
  }

  return { dataUrl: webp, didResize, didAdjustQuality };
};

export const prepareImageData = async (
  dataUrl: string
): Promise<{ image: ImageData; notices: string[] }> => {
  const { dataUrl: webp, didResize, didAdjustQuality } = await normalizeImageToWebp(dataUrl);

  if (webp.length > MAX_TOTAL_BYTES) {
    throw new Error('Image trop lourde après compression');
  }

  const notices: string[] = [];
  if (didResize || didAdjustQuality) notices.push('compressed');

  const image = chunkDataUrl(webp);
  if (image.kind === 'chunked') notices.push('chunked');

  return { image, notices };
};
