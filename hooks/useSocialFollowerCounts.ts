import { useEffect, useState } from 'react';
import type { SocialAccount, SocialPlatform } from '../types';
import {
  getFollowerCountMode,
  normalizeSocialHandle,
  readFollowerCountCache,
  supportsAutoFollowerCount,
  writeFollowerCountCache,
} from '../services/socialFollowerCounts';

type FollowerCountMap = Partial<Record<SocialPlatform, number>>;
type FollowerStatusMap = Partial<Record<SocialPlatform, boolean>>;
type FollowerErrorMap = Partial<Record<SocialPlatform, string>>;

export const useSocialFollowerCounts = (accounts: SocialAccount[] = []) => {
  const [counts, setCounts] = useState<FollowerCountMap>({});
  const [loading, setLoading] = useState<FollowerStatusMap>({});
  const [errors, setErrors] = useState<FollowerErrorMap>({});

  useEffect(() => {
    const eligibleAccounts = accounts.filter(
      (account) =>
        getFollowerCountMode(account) === 'auto' &&
        supportsAutoFollowerCount(account.platform) &&
        normalizeSocialHandle(account.handle)
    );

    const eligiblePlatforms = new Set(eligibleAccounts.map((account) => account.platform));

    if (eligibleAccounts.length === 0) {
      setCounts({});
      setLoading({});
      setErrors({});
      return;
    }

    setCounts((prev) =>
      Object.fromEntries(
        Object.entries(prev).filter(([platform]) => eligiblePlatforms.has(platform as SocialPlatform))
      ) as FollowerCountMap
    );
    setLoading((prev) =>
      Object.fromEntries(
        Object.entries(prev).filter(([platform]) => eligiblePlatforms.has(platform as SocialPlatform))
      ) as FollowerStatusMap
    );
    setErrors((prev) =>
      Object.fromEntries(
        Object.entries(prev).filter(([platform]) => eligiblePlatforms.has(platform as SocialPlatform))
      ) as FollowerErrorMap
    );

    const controller = new AbortController();

    eligibleAccounts.forEach((account) => {
      const normalizedHandle = normalizeSocialHandle(account.handle);
      const cachedCount = readFollowerCountCache(account.platform, normalizedHandle);

      setCounts((prev) => ({ ...prev, [account.platform]: undefined }));

      if (typeof cachedCount === 'number') {
        setCounts((prev) => ({ ...prev, [account.platform]: cachedCount }));
        setErrors((prev) => ({ ...prev, [account.platform]: undefined }));
        setLoading((prev) => ({ ...prev, [account.platform]: false }));
        return;
      }

      setLoading((prev) => ({ ...prev, [account.platform]: true }));
      setErrors((prev) => ({ ...prev, [account.platform]: undefined }));

      const params = new URLSearchParams({
        platform: account.platform,
        handle: normalizedHandle,
      });

      fetch(`/api/social/follower-count?${params.toString()}`, {
        signal: controller.signal,
      })
        .then(async (response) => {
          const payload = await response.json();

          if (!response.ok || !payload.ok || typeof payload.followerCount !== 'number') {
            throw new Error(payload.error || 'Unable to fetch follower count.');
          }

          writeFollowerCountCache(account.platform, normalizedHandle, payload.followerCount);
          setCounts((prev) => ({ ...prev, [account.platform]: payload.followerCount }));
          setErrors((prev) => ({ ...prev, [account.platform]: undefined }));
        })
        .catch((error: Error) => {
          if (controller.signal.aborted) return;

          setErrors((prev) => ({
            ...prev,
            [account.platform]: error.message || 'Unable to fetch follower count.',
          }));
        })
        .finally(() => {
          if (controller.signal.aborted) return;
          setLoading((prev) => ({ ...prev, [account.platform]: false }));
        });
    });

    return () => controller.abort();
  }, [accounts]);

  return { counts, loading, errors };
};
