import type { SocialAccount, SocialPlatform } from '../types';

export type FollowerCountMode = 'manual' | 'auto';

export type SocialFollowerCountResponse = {
  ok: boolean;
  platform: SocialPlatform;
  handle: string;
  followerCount?: number;
  source?: string;
  error?: string;
};

export const AUTO_FOLLOWER_COUNT_PLATFORMS: SocialPlatform[] = [
  'github',
  'bluesky',
  'youtube',
  'instagram',
  'tiktok',
];

const followerCountCache = new Map<string, number>();

export const normalizeSocialHandle = (value: string): string => value.trim().replace(/^@+/, '');

export const supportsAutoFollowerCount = (platform: SocialPlatform): boolean =>
  AUTO_FOLLOWER_COUNT_PLATFORMS.includes(platform);

export const getFollowerCountMode = (account: Pick<SocialAccount, 'followerCountMode'>) =>
  account.followerCountMode === 'auto' ? 'auto' : 'manual';

export const getSocialAccountCacheKey = (platform: SocialPlatform, handle: string): string =>
  `${platform}:${normalizeSocialHandle(handle).toLowerCase()}`;

export const getDisplayFollowerCount = (
  account: Pick<SocialAccount, 'followerCount' | 'followerCountMode'>,
  liveCount?: number
): number | undefined => {
  if (getFollowerCountMode(account) === 'auto' && typeof liveCount === 'number') {
    return liveCount;
  }

  return account.followerCount;
};

export const readFollowerCountCache = (platform: SocialPlatform, handle: string): number | undefined =>
  followerCountCache.get(getSocialAccountCacheKey(platform, handle));

export const writeFollowerCountCache = (
  platform: SocialPlatform,
  handle: string,
  followerCount: number
): void => {
  followerCountCache.set(getSocialAccountCacheKey(platform, handle), followerCount);
};
