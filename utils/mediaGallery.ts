import { BlockData, ImageData, MediaGalleryItem } from '../types';
import { resolveImageSrc } from './imageData';

export type MediaGalleryTransition = 'fade' | 'slide' | 'zoom' | 'blur';

export const MEDIA_GALLERY_TRANSITIONS: Array<{
  value: MediaGalleryTransition;
  label: string;
}> = [
  { value: 'fade', label: 'Fade' },
  { value: 'slide', label: 'Slide' },
  { value: 'zoom', label: 'Zoom' },
  { value: 'blur', label: 'Blur' },
];

export const MEDIA_GALLERY_INTERVAL_MS = 4000;
export const MEDIA_GALLERY_DURATION_MS = 600;

export const isVideoMediaUrl = (url?: string): boolean => /\.(mp4|webm|ogg|mov)$/i.test(url || '');

const normalizeMediaValue = (value?: string | ImageData): string | ImageData | undefined => {
  if (!value) return undefined;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed || undefined;
  }
  return value;
};

const getMediaIdentity = (value?: string | ImageData): string => {
  if (!value) return '';
  if (typeof value === 'string') return value.trim();
  if (value.kind === 'data') return value.dataUrl;
  return `${value.mime}:${value.chunks.join('')}`;
};

export const createMediaGalleryItem = (
  url: string | ImageData,
  enabled: boolean = true
): MediaGalleryItem => ({
  id:
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2, 11),
  url,
  enabled,
});

export const normalizeMediaGalleryState = (
  block: Pick<BlockData, 'imageUrl' | 'mediaGallery' | 'mediaGalleryItems'>
): MediaGalleryItem[] => {
  if (block.mediaGalleryItems?.length) {
    return block.mediaGalleryItems
      .map((item) => ({
        ...item,
        url: normalizeMediaValue(item.url),
      }))
      .filter((item): item is MediaGalleryItem => !!item.url);
  }

  const rawItems = [block.imageUrl, ...(block.mediaGallery || [])];
  const seen = new Set<string>();

  return rawItems
    .map((item) => normalizeMediaValue(item))
    .filter((item): item is string | ImageData => {
      if (!item) return false;
      const identity = getMediaIdentity(item);
      if (!identity || seen.has(identity)) return false;
      seen.add(identity);
      return true;
    })
    .map((item) => createMediaGalleryItem(item, true));
};

export const getMediaGalleryItems = (
  block: Pick<BlockData, 'imageUrl' | 'mediaGallery' | 'mediaGalleryItems'>
): string[] =>
  normalizeMediaGalleryState(block)
    .filter((item) => item.enabled)
    .map((item) => resolveImageSrc(item.url))
    .filter((item): item is string => !!item);

export const syncMediaGalleryBlock = (
  block: BlockData,
  items: MediaGalleryItem[],
  transition: MediaGalleryTransition,
  intervalMs: number = block.mediaGalleryIntervalMs || MEDIA_GALLERY_INTERVAL_MS,
  durationMs: number = block.mediaGalleryDurationMs || MEDIA_GALLERY_DURATION_MS
): BlockData => {
  const mediaGalleryItems = items
    .map((item) => ({
      ...item,
      url: normalizeMediaValue(item.url),
    }))
    .filter((item) => item.url);
  const mediaGallery = mediaGalleryItems.filter((item) => item.enabled).map((item) => item.url);

  return {
    ...block,
    mediaMode: block.mediaMode || 'gallery',
    imageUrl: mediaGallery[0] || block.imageUrl,
    mediaGallery,
    mediaGalleryItems,
    mediaGalleryTransition: transition,
    mediaGalleryIntervalMs: Math.max(250, intervalMs),
    mediaGalleryDurationMs: Math.max(100, durationMs),
  };
};

export const getMediaGalleryMotion = (
  transition: MediaGalleryTransition = 'fade',
  durationMs: number = MEDIA_GALLERY_DURATION_MS
) => {
  const duration = Math.max(0.1, durationMs / 1000);

  switch (transition) {
    case 'slide':
      return {
        initial: { opacity: 0, x: 40 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -40 },
        transition: { duration, ease: [0.22, 1, 0.36, 1] },
      };
    case 'zoom':
      return {
        initial: { opacity: 0, scale: 1.08 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.96 },
        transition: { duration, ease: [0.22, 1, 0.36, 1] },
      };
    case 'blur':
      return {
        initial: { opacity: 0, filter: 'blur(18px)', scale: 1.03 },
        animate: { opacity: 1, filter: 'blur(0px)', scale: 1 },
        exit: { opacity: 0, filter: 'blur(18px)', scale: 1.01 },
        transition: { duration, ease: 'easeInOut' },
      };
    case 'fade':
    default:
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration, ease: 'easeInOut' },
      };
  }
};
