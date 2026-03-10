import type { NextApiRequest, NextApiResponse } from 'next';
import type { SocialPlatform } from '../../../types';
import {
  normalizeSocialHandle,
  supportsAutoFollowerCount,
  type SocialFollowerCountResponse,
} from '../../../services/socialFollowerCounts';

const DEFAULT_HEADERS = {
  Accept: 'text/html,application/json',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 FRVBento',
  'Accept-Language': 'en-US,en;q=0.9',
};

const decodeHtmlEntities = (value: string): string =>
  value
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#039;/g, "'")
    .replace(/&amp;/g, '&');

const parseCompactCount = (value: string): number | undefined => {
  const normalized = value
    .trim()
    .replace(/\s+/g, '')
    .replace(/,/g, '')
    .replace(/followers?|following|posts?|subscribers?/gi, '');

  const match = normalized.match(/^(\d+(?:\.\d+)?)([KMB]|thousand|million|billion)?$/i);
  if (!match) return undefined;

  const amount = Number(match[1]);
  if (!Number.isFinite(amount)) return undefined;

  const suffix = (match[2] || '').toLowerCase();
  const multiplier =
    suffix === 'b' || suffix === 'billion'
      ? 1_000_000_000
      : suffix === 'm' || suffix === 'million'
        ? 1_000_000
        : suffix === 'k' || suffix === 'thousand'
          ? 1_000
          : 1;
  return Math.round(amount * multiplier);
};

const matchFirstCount = (text: string, patterns: RegExp[]): number | undefined => {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (!match?.[1]) continue;
    const parsed = parseCompactCount(match[1]);
    if (typeof parsed === 'number') return parsed;
  }

  return undefined;
};

const getGitHubFollowerCount = async (handle: string): Promise<number> => {
  const response = await fetch(`https://api.github.com/users/${encodeURIComponent(handle)}`, {
    headers: {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'FRVBento',
    },
  });

  if (!response.ok) {
    throw new Error(response.status === 404 ? 'GitHub profile not found.' : 'GitHub lookup failed.');
  }

  const payload = await response.json();
  if (typeof payload.followers !== 'number') {
    throw new Error('GitHub follower count unavailable.');
  }

  return payload.followers;
};

const getBlueskyFollowerCount = async (handle: string): Promise<number> => {
  const response = await fetch(
    `https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile?actor=${encodeURIComponent(handle)}`,
    {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'FRVBento',
      },
    }
  );

  if (!response.ok) {
    throw new Error(response.status === 404 ? 'Bluesky profile not found.' : 'Bluesky lookup failed.');
  }

  const payload = await response.json();
  if (typeof payload.followersCount !== 'number') {
    throw new Error('Bluesky follower count unavailable.');
  }

  return payload.followersCount;
};

const getInstagramFollowerCount = async (handle: string): Promise<number> => {
  const response = await fetch(`https://www.instagram.com/${encodeURIComponent(handle)}/`, {
    headers: DEFAULT_HEADERS,
  });

  if (!response.ok) {
    throw new Error(
      response.status === 404 ? 'Instagram profile not found.' : 'Instagram lookup failed.'
    );
  }

  const html = decodeHtmlEntities(await response.text());
  const parsed = matchFirstCount(html, [
    /<meta[^>]+property="og:description"[^>]+content="([0-9.,]+\s*[KMB]?)\s+Followers/i,
    /<meta[^>]+content="([0-9.,]+\s*[KMB]?)\s+Followers/i,
  ]);

  if (typeof parsed !== 'number') {
    throw new Error('Instagram follower count unavailable.');
  }

  return parsed;
};

const getTikTokFollowerCount = async (handle: string): Promise<number> => {
  const response = await fetch(`https://www.tiktok.com/@${encodeURIComponent(handle)}`, {
    headers: DEFAULT_HEADERS,
  });

  if (!response.ok) {
    throw new Error(response.status === 404 ? 'TikTok profile not found.' : 'TikTok lookup failed.');
  }

  const html = await response.text();
  const directMatch = html.match(/"followerCount":\s*(\d{1,15})/i);
  if (directMatch?.[1]) {
    return Number(directMatch[1]);
  }

  const parsed = matchFirstCount(html, [
    /"seo_abtest_description":"[^"]*?([0-9.,]+\s*(?:[KMB]|thousand|million|billion)?)\s+Followers/i,
    /"followerCount":\s*"([^"]+)"/i,
  ]);

  if (typeof parsed !== 'number') {
    throw new Error('TikTok follower count unavailable.');
  }

  return parsed;
};

const getYouTubeFollowerCount = async (handle: string): Promise<number> => {
  const response = await fetch(`https://www.youtube.com/@${encodeURIComponent(handle)}`, {
    headers: DEFAULT_HEADERS,
  });

  if (!response.ok) {
    throw new Error(response.status === 404 ? 'YouTube profile not found.' : 'YouTube lookup failed.');
  }

  const html = decodeHtmlEntities(await response.text());
  const parsed = matchFirstCount(html, [
    /([0-9.,]+\s*(?:[KMB]|thousand|million|billion)?)\s+subscribers/i,
    /"subscriberCountText":\{"accessibility":\{"accessibilityData":\{"label":"([0-9.,]+\s*(?:[KMB]|thousand|million|billion)?)[^"]*subscribers/i,
    /"subscriberCountText":\{"simpleText":"([0-9.,]+\s*(?:[KMB]|thousand|million|billion)?)\s+subscribers/i,
    /<meta[^>]+name="description"[^>]+content="([0-9.,]+\s*(?:[KMB]|thousand|million|billion)?)\s+subscribers/i,
    /<meta[^>]+property="og:description"[^>]+content="([0-9.,]+\s*(?:[KMB]|thousand|million|billion)?)\s+subscribers/i,
  ]);

  if (typeof parsed !== 'number') {
    throw new Error('YouTube subscriber count unavailable.');
  }

  return parsed;
};

const getFollowerCount = async (
  platform: SocialPlatform,
  handle: string
): Promise<{ followerCount: number; source: string }> => {
  switch (platform) {
    case 'github':
      return {
        followerCount: await getGitHubFollowerCount(handle),
        source: 'GitHub REST API',
      };
    case 'bluesky':
      return {
        followerCount: await getBlueskyFollowerCount(handle),
        source: 'Bluesky public API',
      };
    case 'instagram':
      return {
        followerCount: await getInstagramFollowerCount(handle),
        source: 'Instagram page scrape (experimental)',
      };
    case 'tiktok':
      return {
        followerCount: await getTikTokFollowerCount(handle),
        source: 'TikTok page scrape (experimental)',
      };
    case 'youtube':
      return {
        followerCount: await getYouTubeFollowerCount(handle),
        source: 'YouTube page scrape (experimental)',
      };
    default:
      throw new Error('Automatic follower count is not supported for this platform.');
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SocialFollowerCountResponse>
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({
      ok: false,
      platform: 'custom',
      handle: '',
      error: 'Method not allowed.',
    });
  }

  const platform = String(req.query.platform || '') as SocialPlatform;
  const handle = normalizeSocialHandle(String(req.query.handle || ''));

  if (!platform || !handle) {
    return res.status(400).json({
      ok: false,
      platform: platform || 'custom',
      handle,
      error: 'Missing platform or handle.',
    });
  }

  if (!supportsAutoFollowerCount(platform)) {
    return res.status(400).json({
      ok: false,
      platform,
      handle,
      error: 'Automatic follower count is not supported for this platform.',
    });
  }

  try {
    const { followerCount, source } = await getFollowerCount(platform, handle);

    res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=86400');

    return res.status(200).json({
      ok: true,
      platform,
      handle,
      followerCount,
      source,
    });
  } catch (error) {
    return res.status(502).json({
      ok: false,
      platform,
      handle,
      error: error instanceof Error ? error.message : 'Unable to fetch follower count.',
    });
  }
}
