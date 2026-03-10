import React, { useEffect, useState } from 'react';
import type { AvatarStyle, SavedBento, BlockData } from '../types';
import { BlockType } from '../types';
import { resolveImageSrc } from '../utils/imageData';
import Block from './Block';
import { getMobileLayout, MOBILE_GRID_CONFIG } from '../utils/mobileLayout';
import { ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import ProfileSocialIcons from './ProfileSocialIcons';

interface BentoRenderProps {
  bento: SavedBento;
}

const BentoRender: React.FC<BentoRenderProps> = ({ bento }) => {
  const [expandedCollections, setExpandedCollections] = useState<Record<string, boolean>>({});

  // Avatar style helpers
  const getAvatarStyle = (style?: AvatarStyle): React.CSSProperties => {
    const s = style || {
      shape: 'rounded',
      shadow: true,
      border: true,
      borderColor: '#ffffff',
      borderWidth: 4,
    };
    const radius = s.shape === 'circle' ? '9999px' : s.shape === 'square' ? '0' : '1.5rem';
    const shadow = s.shadow !== false ? '0 25px 50px -12px rgba(0,0,0,0.15)' : 'none';
    const border =
      s.border !== false ? `${s.borderWidth || 4}px solid ${s.borderColor || '#ffffff'}` : 'none';
    return { borderRadius: radius, boxShadow: shadow, border };
  };

  const profile = bento.data.profile;
  const blocks = bento.data.blocks;
  const pageLayout = profile.pageLayout || 'bento';
  const avatarSrc = resolveImageSrc(profile.avatarUrl);
  const backgroundSrc = resolveImageSrc(profile.backgroundImage);
  const isDark = profile.theme === 'dark';
  const headingText = isDark ? 'text-gray-100' : 'text-gray-900';
  const bodyText = isDark ? 'text-gray-300' : 'text-gray-500';
  const applyThemeToBlock = (block: BlockData): BlockData => {
    if (block.customBackground || block.color) return block;
    return {
      ...block,
      color: isDark ? 'bg-gray-900' : 'bg-white',
      textColor: block.textColor ?? (isDark ? 'text-gray-100' : 'text-gray-900'),
    };
  };

  const isCollectionBlock = (block: BlockData) => block.type === BlockType.COLLECTION;

  // Sort blocks for mobile (by row, then column)
  const sortedBlocks = [...blocks].sort((a, b) => {
    const aRow = a.gridRow ?? 999;
    const bRow = b.gridRow ?? 999;
    const aCol = a.gridColumn ?? 999;
    const bCol = b.gridColumn ?? 999;
    if (aRow !== bRow) return aRow - bRow;
    return aCol - bCol;
  });
  const verticalTopLevelBlocks = sortedBlocks.filter((block) => !block.collectionId);

  useEffect(() => {
    setExpandedCollections((prev) => {
      const next: Record<string, boolean> = {};
      blocks.forEach((block) => {
        if (isCollectionBlock(block)) {
          next[block.id] = prev[block.id] ?? block.expandedByDefault !== false;
        }
      });
      return next;
    });
  }, [blocks]);

  // Render social icons
  const renderSocialIcons = () => {
    return <ProfileSocialIcons profile={profile} isDark={isDark} />;
  };

  // Background style
  const bgStyle: React.CSSProperties = backgroundSrc
    ? {
        backgroundImage: `url('${backgroundSrc}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }
    : { backgroundColor: profile.backgroundColor || (isDark ? '#0b0b0f' : '#f8fafc') };

  const avatarStyle = getAvatarStyle(profile.avatarStyle);
  const nameStyle = profile.nameColor ? { color: profile.nameColor } : undefined;
  const bioStyle = profile.bioColor ? { color: profile.bioColor } : undefined;

  return (
    <div
      className={`min-h-screen font-sans relative ${isDark ? 'text-gray-100' : 'text-gray-900'}`}
      style={bgStyle}
    >
      {profile.customCss && profile.customCss.trim().length > 0 && (
        <style>{profile.customCss}</style>
      )}
      {/* Background blur overlay */}
      {backgroundSrc && profile.backgroundBlur && profile.backgroundBlur > 0 && (
        <div
          className="fixed inset-0 z-0 pointer-events-none"
          style={{
            backdropFilter: `blur(${profile.backgroundBlur}px)`,
            WebkitBackdropFilter: `blur(${profile.backgroundBlur}px)`,
          }}
        />
      )}

      <div className="relative z-10">
        {pageLayout === 'vertical-links' ? (
          <div className="mx-auto w-full max-w-2xl px-4 pt-8 pb-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-28 h-28 mb-5 overflow-hidden bg-gray-100" style={avatarStyle}>
                {avatarSrc ? (
                  <img src={avatarSrc} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-3xl font-bold">
                    {profile.name.charAt(0)}
                  </div>
                )}
              </div>
              <h1
                className={`text-3xl font-extrabold tracking-tight leading-none mb-2 ${headingText}`}
                style={nameStyle}
              >
                {profile.name}
              </h1>
              <p
                className={`text-sm font-medium whitespace-pre-wrap max-w-md leading-relaxed ${bodyText}`}
                style={bioStyle}
              >
                {profile.bio || '—'}
              </p>
              {renderSocialIcons()}
            </div>

            <div className="mt-6 space-y-4">
              {verticalTopLevelBlocks.map((block) => {
                if (isCollectionBlock(block)) {
                  const children = sortedBlocks.filter((child) => child.collectionId === block.id);
                  const themedBlock = applyThemeToBlock(block);
                  const isExpanded =
                    expandedCollections[block.id] ?? block.expandedByDefault !== false;

                  return (
                    <div
                      key={block.id}
                      className={`rounded-[1.1rem] border overflow-hidden shadow-sm ${
                        isDark ? 'border-gray-800' : 'border-gray-200'
                      } ${themedBlock.color || (isDark ? 'bg-gray-900' : 'bg-white')} ${
                        themedBlock.textColor || (isDark ? 'text-gray-100' : 'text-gray-900')
                      }`}
                      style={
                        themedBlock.customBackground
                          ? { background: themedBlock.customBackground }
                          : undefined
                      }
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedCollections((prev) => ({
                            ...prev,
                            [block.id]: !isExpanded,
                          }))
                        }
                        className="w-full flex items-center justify-between px-4 py-4 text-left"
                      >
                        <p className="text-sm font-bold">{block.title || 'Collection'}</p>
                        <ChevronDown
                          size={16}
                          className={`transition-transform ${isDark ? 'text-gray-400' : 'text-gray-500'} ${
                            isExpanded ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.22, ease: 'easeInOut' }}
                            className="overflow-hidden"
                          >
                            <div
                              className={`px-4 pb-4 space-y-3 border-t ${
                                isDark
                                  ? 'border-gray-800 bg-black/10'
                                  : 'border-gray-100 bg-gray-50/80'
                              }`}
                            >
                              {children.map((child) => {
                                const normalizedChild =
                                  child.type === BlockType.SOCIAL_ICON
                                    ? { ...applyThemeToBlock(child), colSpan: 9, rowSpan: 2 }
                                    : {
                                        ...applyThemeToBlock(child),
                                        colSpan: 9,
                                        gridColumn: undefined,
                                        gridRow: undefined,
                                      };
                                const childHeight = Math.max(96, Math.min(320, child.rowSpan * 64));

                                return (
                                  <div
                                    key={child.id}
                                    style={{ height: `${childHeight}px` }}
                                    className="pt-3"
                                  >
                                    <Block
                                      block={{
                                        ...normalizedChild,
                                        gridColumn: undefined,
                                        gridRow: undefined,
                                      }}
                                      isSelected={false}
                                      isDragTarget={false}
                                      isDragging={false}
                                      enableResize={false}
                                      isResizing={false}
                                      onResizeStart={undefined}
                                      onEdit={() => {}}
                                      onDelete={() => {}}
                                      onDragStart={() => {}}
                                      onDragEnter={() => {}}
                                      onDragEnd={() => {}}
                                      onDrop={() => {}}
                                      enableTiltEffect={true}
                                      previewMode={true}
                                    />
                                  </div>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                }

                const normalizedBlock =
                  block.type === BlockType.SOCIAL_ICON
                    ? { ...applyThemeToBlock(block), colSpan: 9, rowSpan: 2 }
                    : {
                        ...applyThemeToBlock(block),
                        colSpan: 9,
                        gridColumn: undefined,
                        gridRow: undefined,
                      };
                const blockHeight = Math.max(96, Math.min(320, block.rowSpan * 64));

                return (
                  <div key={block.id} style={{ height: `${blockHeight}px` }}>
                    <Block
                      block={{
                        ...normalizedBlock,
                        gridColumn: undefined,
                        gridRow: undefined,
                      }}
                      isSelected={false}
                      isDragTarget={false}
                      isDragging={false}
                      enableResize={false}
                      isResizing={false}
                      onResizeStart={undefined}
                      onEdit={() => {}}
                      onDelete={() => {}}
                      onDragStart={() => {}}
                      onDragEnter={() => {}}
                      onDragEnd={() => {}}
                      onDrop={() => {}}
                      enableTiltEffect={true}
                      previewMode={true}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <>
            <div className="hidden lg:flex">
              <div className="fixed left-0 top-0 w-[420px] h-screen flex flex-col justify-center items-start px-12 z-10">
                <div className="flex flex-col items-start text-left">
                  <div className="relative group mb-8">
                    <div className="w-40 h-40 overflow-hidden bg-gray-100" style={avatarStyle}>
                      {avatarSrc ? (
                        <img
                          src={avatarSrc}
                          alt={profile.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl font-bold">
                          {profile.name.charAt(0)}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-3 w-full max-w-xs">
                    <h1
                      className={`text-4xl font-bold tracking-tight leading-[1.1] ${headingText}`}
                      style={nameStyle}
                    >
                      {profile.name}
                    </h1>
                    <p
                      className={`text-base font-medium leading-relaxed whitespace-pre-wrap ${bodyText}`}
                      style={bioStyle}
                    >
                      {profile.bio || '—'}
                    </p>
                    {renderSocialIcons()}
                  </div>
                </div>
              </div>

              <div className="ml-[420px] flex-1 p-12 pt-24">
                <div
                  className="grid gap-2"
                  style={{ gridTemplateColumns: 'repeat(9, 1fr)', gridAutoRows: '64px' }}
                >
                  {blocks.map((block, index) => (
                    <Block
                      key={block.id}
                      block={{ ...applyThemeToBlock(block), zIndex: index + 1 }}
                      isSelected={false}
                      isDragTarget={false}
                      isDragging={false}
                      enableResize={false}
                      isResizing={false}
                      onResizeStart={undefined}
                      onEdit={() => {}}
                      onDelete={() => {}}
                      onDragStart={() => {}}
                      onDragEnter={() => {}}
                      onDragEnd={() => {}}
                      onDrop={() => {}}
                      enableTiltEffect={true}
                      previewMode={true}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:hidden">
              <div className="p-4 pt-8 flex flex-col items-center text-center">
                <div className="w-24 h-24 mb-4 overflow-hidden bg-gray-100" style={avatarStyle}>
                  {avatarSrc ? (
                    <img
                      src={avatarSrc}
                      alt={profile.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl font-bold">
                      {profile.name.charAt(0)}
                    </div>
                  )}
                </div>
                <h1
                  className={`text-2xl font-extrabold tracking-tight leading-none mb-2 ${headingText}`}
                  style={nameStyle}
                >
                  {profile.name}
                </h1>
                <p
                  className={`text-sm font-medium whitespace-pre-wrap max-w-xs leading-relaxed ${bodyText}`}
                  style={bioStyle}
                >
                  {profile.bio}
                </p>
                <ProfileSocialIcons profile={profile} isDark={isDark} centered />
              </div>

              <div className="p-4">
                <div
                  className="grid pb-8"
                  style={{
                    gridTemplateColumns: `repeat(${MOBILE_GRID_CONFIG.columns}, 1fr)`,
                    gridAutoRows: `${MOBILE_GRID_CONFIG.rowHeight}px`,
                    gap: `${MOBILE_GRID_CONFIG.gap}px`,
                  }}
                >
                  {sortedBlocks.map((block) => {
                    const mobileLayout = getMobileLayout(block);
                    return (
                      <div
                        key={block.id}
                        style={{
                          gridColumn: `span ${mobileLayout.colSpan}`,
                          gridRow: `span ${mobileLayout.rowSpan}`,
                        }}
                      >
                        <Block
                          block={{
                            ...applyThemeToBlock(block),
                            gridColumn: undefined,
                            gridRow: undefined,
                          }}
                          isSelected={false}
                          isDragTarget={false}
                          isDragging={false}
                          enableResize={false}
                          isResizing={false}
                          onResizeStart={undefined}
                          onEdit={() => {}}
                          onDelete={() => {}}
                          onDragStart={() => {}}
                          onDragEnter={() => {}}
                          onDragEnd={() => {}}
                          onDrop={() => {}}
                          enableTiltEffect={true}
                          previewMode={true}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Footer */}
        {profile.showBranding !== false && (
          <footer className="w-full py-10 text-center">
            <p className={`text-sm font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              Made with <span className="text-red-400">♥</span> using{' '}
              <a
                href="https://github.com/yoanbernabeu/openbento"
                target="_blank"
                rel="noopener noreferrer"
                className={`font-semibold transition-colors ${
                  isDark ? 'hover:text-violet-300' : 'hover:text-violet-500'
                }`}
              >
                OpenBento
              </a>.
              Hébergé par{' '}
                            <a
                href="https://frvtubers.com"
                target="_blank"
                rel="noopener noreferrer"
                className={`font-semibold transition-colors ${
                  isDark ? 'hover:text-violet-300' : 'hover:text-violet-500'
                }`}
              >
                FRVtubers
              </a>.
            </p>
          </footer>
        )}
      </div>
    </div>
  );
};

export default BentoRender;
