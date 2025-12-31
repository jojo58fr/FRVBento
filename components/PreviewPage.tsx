import React, { useEffect, useMemo, useState } from 'react';
import type { AvatarStyle, BlockData, SavedBento } from '../types';
import { generatePreviewSrcDoc } from '../services/exportService';
import { getBento, getOrCreateActiveBento, setActiveBentoId } from '../services/storageService';
import Block from './Block';
import { buildSocialUrl, formatFollowerCount, getSocialPlatformOption } from '../socialPlatforms';

const PreviewPage: React.FC = () => {
  const [bento, setBento] = useState<SavedBento | null>(null);
  const [mode, setMode] = useState<'builder' | 'export'>('builder');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedId = params.get('id')?.trim();
    const requestedMode = params.get('mode');
    setMode(requestedMode === 'export' ? 'export' : 'builder');
    const requested = requestedId ? getBento(requestedId) : null;

    const resolved = requested || getOrCreateActiveBento();
    if (requested) setActiveBentoId(requested.id);
    setBento(resolved);
  }, []);

  const srcDoc = useMemo(() => {
    if (!bento || mode !== 'export') return '';
    return generatePreviewSrcDoc(bento.data, { siteId: bento.id });
  }, [bento, mode]);

  const getAvatarClasses = (style?: AvatarStyle) => {
    const s = style || { shape: 'rounded', shadow: true, border: true };
    const classes: string[] = ['w-full', 'h-full', 'object-cover', 'transition-transform', 'duration-500', 'group-hover:scale-110'];
    return classes.join(' ');
  };

  const getAvatarContainerClasses = (style?: AvatarStyle) => {
    const s = style || { shape: 'rounded', shadow: true, border: true };
    const classes: string[] = ['w-40', 'h-40', 'overflow-hidden', 'relative', 'z-10', 'bg-gray-100'];

    if (s.shape === 'circle') classes.push('rounded-full');
    else if (s.shape === 'square') classes.push('rounded-none');
    else classes.push('rounded-3xl');

    if (s.shadow) classes.push('shadow-2xl');

    return classes.join(' ');
  };

  const getAvatarContainerStyle = (style?: AvatarStyle): React.CSSProperties => {
    const s = style || { shape: 'rounded', shadow: true, border: true, borderColor: '#ffffff', borderWidth: 4 };
    const styles: React.CSSProperties = {};

    if (s.border) {
      styles.border = `${s.borderWidth || 4}px solid ${s.borderColor || '#ffffff'}`;
    }

    return styles;
  };

  if (!bento) {
    return (
      <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center text-gray-400">
        Loading...
      </div>
    );
  }

  if (mode === 'export') {
    return (
      <div className="min-h-screen bg-gray-100">
        <iframe title="Preview" srcDoc={srcDoc} className="w-full h-screen border-0" />
      </div>
    );
  }

  const profile = bento.data.profile;
  const blocks = bento.data.blocks;
  const noop = () => {};
  const noopId = (_id: string) => {};
  const noopBlock = (_block: BlockData) => {};

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans overflow-x-hidden">
      <div className="flex-1 relative min-h-screen">
        <div className="hidden lg:flex fixed left-0 top-0 w-[420px] h-screen flex-col justify-center items-start px-12 z-10">
          <div className="flex flex-col items-start text-left">
            <div className="relative group mb-8">
              <div className={getAvatarContainerClasses(profile.avatarStyle)} style={getAvatarContainerStyle(profile.avatarStyle)}>
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt={profile.name} className={getAvatarClasses(profile.avatarStyle)} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl font-bold">
                    {profile.name.charAt(0)}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3 w-full max-w-xs">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 leading-[1.1]">{profile.name}</h1>
              <p className="text-base text-gray-500 font-medium leading-relaxed whitespace-pre-wrap">
                {profile.bio || '—'}
              </p>

              {profile.showSocialInHeader && profile.socialAccounts && profile.socialAccounts.length > 0 && (
                <div className="flex flex-wrap gap-3 mt-4">
                  {profile.socialAccounts.map((account) => {
                    const option = getSocialPlatformOption(account.platform);
                    if (!option) return null;
                    const BrandIcon = option.brandIcon;
                    const FallbackIcon = option.icon;
                    const url = buildSocialUrl(account.platform, account.handle);
                    const showCount = profile.showFollowerCount && account.followerCount;
                    return (
                      <a
                        key={account.platform}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${showCount ? 'px-3 py-2 rounded-full' : 'w-10 h-10 rounded-full'} bg-white shadow-md flex items-center justify-center gap-2 hover:scale-105 hover:shadow-lg transition-all`}
                        title={option.label}
                      >
                        {BrandIcon ? (
                          <BrandIcon size={20} style={{ color: option.brandColor }} />
                        ) : (
                          <FallbackIcon size={20} className="text-gray-600" />
                        )}
                        {showCount && (
                          <span className="text-sm font-semibold text-gray-700">{formatFollowerCount(account.followerCount)}</span>
                        )}
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="w-full min-h-screen">
          <div className="max-w-[1600px] mx-auto">
            <div className="p-4 lg:p-12 pt-24 lg:pt-24 transition-all duration-300 lg:ml-[420px]">
              <div
                className="grid gap-2"
                style={{ gridTemplateColumns: 'repeat(9, 1fr)', gridAutoRows: '64px' }}
              >
                {blocks.map((block, index) => (
                  <Block
                    key={block.id}
                    block={{ ...block, zIndex: index + 1 }}
                    isSelected={false}
                    isDragTarget={false}
                    isDragging={false}
                    enableResize={false}
                    isResizing={false}
                    onResizeStart={undefined}
                    onEdit={noopBlock}
                    onDelete={noopId}
                    onDragStart={noopId}
                    onDragEnter={noopId}
                    onDragEnd={noop}
                    onDrop={noopId}
                    enableTiltEffect={true}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {profile.showBranding !== false && (
          <footer className="w-full py-10 text-center">
            <p className="text-sm text-gray-400 font-medium">
              Made with <span className="text-red-400">♥</span> using{' '}
              <a
                href="https://github.com/yoanbernabeu/openbento"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 font-semibold hover:text-violet-500 transition-colors"
              >
                OpenBento
              </a>
            </p>
          </footer>
        )}
      </div>
    </div>
  );
};

export default PreviewPage;
