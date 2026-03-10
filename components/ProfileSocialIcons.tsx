import React from 'react';
import type { SocialIconStyle, UserProfile } from '../types';
import { buildSocialUrl, formatFollowerCount, getSocialPlatformOption } from '../socialPlatforms';
import { useSocialFollowerCounts } from '../hooks/useSocialFollowerCounts';
import { getDisplayFollowerCount } from '../services/socialFollowerCounts';

type ProfileSocialIconsProps = {
  profile: UserProfile;
  isDark: boolean;
  centered?: boolean;
  className?: string;
  interactive?: boolean;
  onClick?: () => void;
};

export const getDefaultSocialIconStyle = (isDark: boolean): SocialIconStyle => ({
  shape: 'circle',
  useBrandColor: true,
  iconColor: isDark ? '#f3f4f6' : '#374151',
  backgroundColor: isDark ? '#111827' : '#ffffff',
  backgroundOpacity: isDark ? 80 : 100,
  blur: false,
  blurStrength: 12,
  shadow: true,
  border: true,
  borderColor: isDark ? '#1f2937' : '#f3f4f6',
  borderWidth: 1,
});

const hexToRgba = (hex: string, opacity: number) => {
  const normalized = hex.replace('#', '').trim();
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return hex;
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

const getShapeClass = (shape: SocialIconStyle['shape']) => {
  if (shape === 'square') return 'rounded-none';
  if (shape === 'rounded') return 'rounded-2xl';
  return 'rounded-full';
};

const ProfileSocialIcons: React.FC<ProfileSocialIconsProps> = ({
  profile,
  isDark,
  centered = false,
  className = '',
  interactive = true,
  onClick,
}) => {
  const socialAccounts = profile.socialAccounts || [];
  const { counts } = useSocialFollowerCounts(socialAccounts);

  if (!profile.showSocialInHeader || socialAccounts.length === 0) return null;

  const style = { ...getDefaultSocialIconStyle(isDark), ...profile.socialIconStyle };

  return (
    <div
      className={`flex flex-wrap gap-3 mt-4 ${centered ? 'justify-center' : ''} ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      {socialAccounts.map((account) => {
        const option = getSocialPlatformOption(account.platform);
        if (!option) return null;

        const BrandIcon = option.brandIcon;
        const FallbackIcon = option.icon;
        const url = buildSocialUrl(account.platform, account.handle);
        const followerCount = getDisplayFollowerCount(account, counts[account.platform]);
        const showCount = profile.showFollowerCount && typeof followerCount === 'number';
        const iconColor =
          style.useBrandColor !== false ? option.brandColor || style.iconColor : style.iconColor;
        const countColor = style.useBrandColor === false ? style.iconColor : undefined;

        return (
          <a
            key={account.platform}
            href={url}
            target={interactive ? '_blank' : undefined}
            rel={interactive ? 'noopener noreferrer' : undefined}
            onClick={interactive ? undefined : (event) => event.preventDefault()}
            className={`${
              showCount ? 'px-3 py-2' : 'w-10 h-10'
            } ${getShapeClass(style.shape)} flex items-center justify-center gap-2 font-semibold transition-all hover:scale-105 hover:shadow-lg`}
            title={option.label}
            style={{
              backgroundColor: hexToRgba(
                style.backgroundColor || getDefaultSocialIconStyle(isDark).backgroundColor || '#fff',
                Math.max(0, Math.min(100, style.backgroundOpacity ?? 100)) / 100
              ),
              backdropFilter:
                style.blur && (style.blurStrength ?? 0) > 0
                  ? `blur(${style.blurStrength}px)`
                  : undefined,
              WebkitBackdropFilter:
                style.blur && (style.blurStrength ?? 0) > 0
                  ? `blur(${style.blurStrength}px)`
                  : undefined,
              boxShadow:
                style.shadow !== false ? '0 10px 24px rgba(0, 0, 0, 0.16)' : 'none',
              border:
                style.border !== false
                  ? `${style.borderWidth || 1}px solid ${
                      style.borderColor || getDefaultSocialIconStyle(isDark).borderColor
                    }`
                  : 'none',
            }}
          >
            <span style={iconColor ? { color: iconColor } : undefined}>
              {BrandIcon ? <BrandIcon size={20} /> : FallbackIcon ? <FallbackIcon size={20} /> : null}
            </span>
            {showCount && (
              <span
                className={`text-sm font-semibold ${countColor ? '' : isDark ? 'text-gray-200' : 'text-gray-700'}`}
                style={countColor ? { color: countColor } : undefined}
              >
                {formatFollowerCount(followerCount!)}
              </span>
            )}
          </a>
        );
      })}
    </div>
  );
};

export default ProfileSocialIcons;
