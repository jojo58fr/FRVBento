import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import type { SocialIconStyle, UserProfile } from '../types';
import ColorPickerWidget from './ColorPickerWidget';
import ProfileSocialIcons, { getDefaultSocialIconStyle } from './ProfileSocialIcons';

type SocialIconStyleModalProps = {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  isDark: boolean;
  onStyleChange: (style: SocialIconStyle) => void;
};

const SocialIconStyleModal: React.FC<SocialIconStyleModalProps> = ({
  isOpen,
  onClose,
  profile,
  isDark,
  onStyleChange,
}) => {
  const currentStyle = {
    ...getDefaultSocialIconStyle(isDark),
    ...profile.socialIconStyle,
  };

  const updateStyle = (updates: Partial<SocialIconStyle>) => {
    onStyleChange({ ...currentStyle, ...updates });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 16 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden"
          >
            <div className="p-5 pb-4 flex justify-between items-start border-b border-gray-100">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Social Icons Style</h2>
                <p className="text-gray-500 text-sm mt-0.5">
                  Customize your social icons directly from the profile preview.
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 bg-gray-50 flex justify-center">
              <div className="rounded-2xl border border-gray-200 bg-white px-5 py-6">
                <ProfileSocialIcons
                  profile={{
                    ...profile,
                    showSocialInHeader: true,
                    socialAccounts:
                      profile.socialAccounts?.length
                        ? profile.socialAccounts
                        : [
                            { platform: 'instagram', handle: 'demo' },
                            { platform: 'youtube', handle: 'demo', followerCount: 125000 },
                          ],
                  }}
                  isDark={isDark}
                  centered
                  className="mt-0"
                  interactive={false}
                />
              </div>
            </div>

            <div className="p-5 space-y-5 max-h-[55vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                  Shape
                </label>
                <div className="flex gap-2">
                  {[
                    { value: 'circle', label: 'Round' },
                    { value: 'rounded', label: 'Rounded' },
                    { value: 'square', label: 'Square' },
                  ].map((shape) => (
                    <button
                      key={shape.value}
                      type="button"
                      onClick={() => updateStyle({ shape: shape.value as SocialIconStyle['shape'] })}
                      className={`flex-1 px-3 py-2 rounded-xl border text-sm font-semibold transition-colors ${
                        currentStyle.shape === shape.value
                          ? 'border-violet-500 bg-violet-50 text-violet-700'
                          : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {shape.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    label: 'Use brand colors',
                    value: currentStyle.useBrandColor !== false,
                    onToggle: () =>
                      updateStyle({ useBrandColor: !(currentStyle.useBrandColor !== false) }),
                  },
                  {
                    label: 'Background blur',
                    value: !!currentStyle.blur,
                    onToggle: () => updateStyle({ blur: !currentStyle.blur }),
                  },
                  {
                    label: 'Drop shadow',
                    value: currentStyle.shadow !== false,
                    onToggle: () => updateStyle({ shadow: !currentStyle.shadow }),
                  },
                  {
                    label: 'Border',
                    value: currentStyle.border !== false,
                    onToggle: () => updateStyle({ border: !currentStyle.border }),
                  },
                ].map((item) => (
                  <div key={item.label} className="p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold text-gray-700">{item.label}</span>
                      <button
                        type="button"
                        onClick={item.onToggle}
                        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                          item.value ? 'bg-gray-900' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                            item.value ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                {currentStyle.useBrandColor === false && (
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                      Icon color
                    </label>
                    <ColorPickerWidget
                      value={currentStyle.iconColor || '#374151'}
                      active
                      inline
                      panelClassName="basis-full"
                      ariaLabel="Choose social icon color"
                      title="Icon color"
                      onChange={(hex) => updateStyle({ iconColor: hex })}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Background color
                  </label>
                  <ColorPickerWidget
                    value={currentStyle.backgroundColor || '#ffffff'}
                    active
                    inline
                    panelClassName="basis-full"
                    ariaLabel="Choose social icon background color"
                    title="Background color"
                    onChange={(hex) => updateStyle({ backgroundColor: hex })}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Background opacity
                    </label>
                    <span className="text-xs text-gray-500">
                      {currentStyle.backgroundOpacity ?? 100}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={currentStyle.backgroundOpacity ?? 100}
                    onChange={(e) => updateStyle({ backgroundOpacity: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>

                {currentStyle.blur && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
                        Blur strength
                      </label>
                      <span className="text-xs text-gray-500">{currentStyle.blurStrength ?? 12}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="24"
                      value={currentStyle.blurStrength ?? 12}
                      onChange={(e) => updateStyle({ blurStrength: Number(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                )}

                {currentStyle.border !== false && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                        Border color
                      </label>
                      <ColorPickerWidget
                        value={currentStyle.borderColor || '#e5e7eb'}
                        active
                        inline
                        panelClassName="basis-full"
                        ariaLabel="Choose social icon border color"
                        title="Border color"
                        onChange={(hex) => updateStyle({ borderColor: hex })}
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
                          Border width
                        </label>
                        <span className="text-xs text-gray-500">{currentStyle.borderWidth ?? 1}px</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="6"
                        value={currentStyle.borderWidth ?? 1}
                        onChange={(e) => updateStyle({ borderWidth: Number(e.target.value) })}
                        className="w-full"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="p-5 pt-3 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => onStyleChange(getDefaultSocialIconStyle(isDark))}
                className="flex-1 py-2.5 bg-white text-gray-900 rounded-xl font-bold border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                Reset
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-2.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-colors"
              >
                Apply
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SocialIconStyleModal;
