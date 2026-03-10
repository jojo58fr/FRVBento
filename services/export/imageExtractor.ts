/**
 * Extract base64 images from site data and prepare them for the zip
 */

import JSZip from 'jszip';
import { SiteData } from '../../types';
import { resolveImageSrc } from '../../utils/imageData';
import { base64ToBlob } from './helpers';

export interface ImageMap {
  [key: string]: string;
}

/**
 * Extract all base64 images from SiteData and add them to a zip folder
 * Returns a mapping from image keys to their new paths
 */
export function extractImages(data: SiteData, assetsFolder: JSZip | null): ImageMap {
  const imageMap: ImageMap = {};

  const getExtension = (dataUrl: string): string => {
    const match = dataUrl.match(/^data:image\/([^;]+);base64,/);
    const ext = match?.[1]?.toLowerCase() || 'png';
    if (ext === 'jpeg') return 'jpg';
    if (ext === 'svg+xml') return 'svg';
    return ext;
  };

  // Extract avatar if it's a base64 image
  const avatarSrc = resolveImageSrc(data.profile.avatarUrl);
  if (avatarSrc?.startsWith('data:image')) {
    const blob = base64ToBlob(avatarSrc);
    if (blob && assetsFolder) {
      const ext = getExtension(avatarSrc);
      const filename = `avatar.${ext}`;
      assetsFolder.file(filename, blob);
      imageMap['profile_avatar'] = `/assets/${filename}`;
    }
  }

  // Extract block images
  for (const block of data.blocks) {
    const blockImageSrc = resolveImageSrc(block.imageUrl);
    if (blockImageSrc?.startsWith('data:image')) {
      const blob = base64ToBlob(blockImageSrc);
      if (blob && assetsFolder) {
        const ext = getExtension(blockImageSrc);
        const filename = `block-${block.id}.${ext}`;
        assetsFolder.file(filename, blob);
        imageMap[`block_${block.id}`] = `/assets/${filename}`;
      }
    }

    block.mediaGallery?.forEach((item, index) => {
      const itemSrc = resolveImageSrc(item);
      if (!itemSrc?.startsWith('data:image')) return;

      const blob = base64ToBlob(itemSrc);
      if (blob && assetsFolder) {
        const ext = getExtension(itemSrc);
        const filename = `block-${block.id}-gallery-${index + 1}.${ext}`;
        assetsFolder.file(filename, blob);
        imageMap[`block_${block.id}_gallery_${index}`] = `/assets/${filename}`;
      }
    });

    block.mediaGalleryItems?.forEach((item, index) => {
      const itemSrc = resolveImageSrc(item.url);
      if (!itemSrc?.startsWith('data:image')) return;

      const blob = base64ToBlob(itemSrc);
      if (blob && assetsFolder) {
        const ext = getExtension(itemSrc);
        const filename = `block-${block.id}-gallery-item-${index + 1}.${ext}`;
        assetsFolder.file(filename, blob);
        imageMap[`block_${block.id}_gallery_item_${index}`] = `/assets/${filename}`;
      }
    });
  }

  return imageMap;
}
