/**
 * Extract base64 images from site data and prepare them for the zip
 */

import JSZip from 'jszip';
import { SiteData } from '../../types';
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

  // Extract avatar if it's a base64 image
  if (data.profile.avatarUrl?.startsWith('data:image')) {
    const blob = base64ToBlob(data.profile.avatarUrl);
    if (blob && assetsFolder) {
      assetsFolder.file('avatar.png', blob);
      imageMap['profile_avatar'] = '/assets/avatar.png';
    }
  }

  // Extract block images
  for (const block of data.blocks) {
    if (block.imageUrl?.startsWith('data:image')) {
      const blob = base64ToBlob(block.imageUrl);
      if (blob && assetsFolder) {
        const filename = `block-${block.id}.png`;
        assetsFolder.file(filename, blob);
        imageMap[`block_${block.id}`] = `/assets/${filename}`;
      }
    }

    block.mediaGallery?.forEach((item, index) => {
      if (!item.startsWith('data:image')) return;

      const blob = base64ToBlob(item);
      if (blob && assetsFolder) {
        const filename = `block-${block.id}-gallery-${index + 1}.png`;
        assetsFolder.file(filename, blob);
        imageMap[`block_${block.id}_gallery_${index}`] = `/assets/${filename}`;
      }
    });

    block.mediaGalleryItems?.forEach((item, index) => {
      if (!item.url.startsWith('data:image')) return;

      const blob = base64ToBlob(item.url);
      if (blob && assetsFolder) {
        const filename = `block-${block.id}-gallery-item-${index + 1}.png`;
        assetsFolder.file(filename, blob);
        imageMap[`block_${block.id}_gallery_item_${index}`] = `/assets/${filename}`;
      }
    });
  }

  return imageMap;
}
