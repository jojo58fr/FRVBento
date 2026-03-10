import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, Reorder, useDragControls } from 'framer-motion';
import { Eye, EyeOff, GripVertical, Upload, X } from 'lucide-react';
import type { BlockData, MediaGalleryItem } from '../types';
import {
  createMediaGalleryItem,
  MEDIA_GALLERY_DURATION_MS,
  MEDIA_GALLERY_INTERVAL_MS,
  MEDIA_GALLERY_TRANSITIONS,
  normalizeMediaGalleryState,
  syncMediaGalleryBlock,
} from '../utils/mediaGallery';

type MediaGalleryModalProps = {
  isOpen: boolean;
  block: BlockData | null;
  onClose: () => void;
  onSave: (block: BlockData) => void;
};

type SortableCardProps = {
  item: MediaGalleryItem;
  index: number;
  onRemove: () => void;
  onToggle: () => void;
};

const SortableCard: React.FC<SortableCardProps> = ({ item, index, onRemove, onToggle }) => {
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      value={item}
      dragListener={false}
      dragControls={dragControls}
      onPointerDown={(event) => dragControls.start(event)}
      whileDrag={{
        scale: 1.01,
        boxShadow: '0 24px 48px rgba(0,0,0,0.18)',
        zIndex: 30,
      }}
      transition={{ type: 'spring', stiffness: 360, damping: 32 }}
      className={`list-none bg-white rounded-2xl border shadow-sm overflow-hidden ${
        item.enabled ? 'border-gray-200' : 'border-gray-200 opacity-60'
      }`}
    >
      <div className="flex flex-col md:flex-row">
        <div className="relative md:w-56 md:min-w-56 aspect-[4/3] bg-gray-100">
          <img src={item.url} alt={`Gallery ${index + 1}`} className="w-full h-full object-cover" />
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/70 text-white text-xs font-bold backdrop-blur-sm">
            {index + 1}
          </div>
          <button
            type="button"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={onToggle}
            className={`absolute top-3 right-12 w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-colors ${
              item.enabled
                ? 'bg-emerald-50/95 text-emerald-700 hover:bg-emerald-100'
                : 'bg-gray-100/95 text-gray-600 hover:bg-gray-200'
            }`}
            aria-label={item.enabled ? `Hide image ${index + 1}` : `Show image ${index + 1}`}
          >
            {item.enabled ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>
          <button
            type="button"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={onRemove}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 text-gray-700 hover:bg-white flex items-center justify-center shadow-sm transition-colors"
            aria-label={`Remove image ${index + 1}`}
          >
            <X size={14} />
          </button>
        </div>

        <div className="p-4 space-y-3 flex-1">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-gray-900">Image {index + 1}</div>
              <div className="text-xs text-gray-400">
                {item.enabled ? 'Visible in gallery' : 'Hidden from gallery'}
              </div>
            </div>
            <div className="inline-flex items-center gap-2 text-xs text-gray-400 font-medium touch-none cursor-grab active:cursor-grabbing">
              <GripVertical size={14} />
              Drag
            </div>
          </div>
        </div>
      </div>
    </Reorder.Item>
  );
};

const MediaGalleryModal: React.FC<MediaGalleryModalProps> = ({
  isOpen,
  block,
  onClose,
  onSave,
}) => {
  const [items, setItems] = useState<MediaGalleryItem[]>([]);
  const [transition, setTransition] = useState<BlockData['mediaGalleryTransition']>('fade');
  const [intervalMs, setIntervalMs] = useState(MEDIA_GALLERY_INTERVAL_MS);
  const [durationMs, setDurationMs] = useState(MEDIA_GALLERY_DURATION_MS);

  useEffect(() => {
    if (!isOpen || !block) return;
    setItems(normalizeMediaGalleryState(block));
    setTransition(block.mediaGalleryTransition || 'fade');
    setIntervalMs(block.mediaGalleryIntervalMs || MEDIA_GALLERY_INTERVAL_MS);
    setDurationMs(block.mediaGalleryDurationMs || MEDIA_GALLERY_DURATION_MS);
  }, [isOpen, block]);

  const activeCount = useMemo(() => items.filter((item) => item.enabled).length, [items]);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    const uploaded = await Promise.all(
      files.map(
        (file) =>
          new Promise<MediaGalleryItem>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(createMediaGalleryItem(reader.result as string, true));
            reader.onerror = () => reject(new Error('Failed to read image'));
            reader.readAsDataURL(file);
          })
      )
    );

    setItems((current) => [...current, ...uploaded]);
    event.target.value = '';
  };

  const toggleItem = (index: number) => {
    setItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, enabled: !item.enabled } : item
      )
    );
  };

  const removeItem = (index: number) => {
    setItems((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  if (!block) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 16 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-5xl max-h-[88vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="px-6 py-5 border-b border-gray-100 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Gallery Manager</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  Upload, reorder, activate or deactivate images for this media block.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <motion.div layoutScroll className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50">
              <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
                <label className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-gray-900 text-white font-semibold cursor-pointer hover:bg-black transition-colors">
                  <Upload size={18} />
                  Upload images
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="sr-only"
                    onChange={handleUpload}
                  />
                </label>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Transition
                  </span>
                  <select
                    className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 focus:ring-2 focus:ring-black/5 focus:border-black focus:outline-none"
                    value={transition || 'fade'}
                    onChange={(e) =>
                      setTransition(e.target.value as BlockData['mediaGalleryTransition'])
                    }
                  >
                    {MEDIA_GALLERY_TRANSITIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block">
                  <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Change Every
                  </span>
                  <input
                    type="number"
                    min={250}
                    step={250}
                    value={intervalMs}
                    onChange={(e) =>
                      setIntervalMs(Number(e.target.value) || MEDIA_GALLERY_INTERVAL_MS)
                    }
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 focus:ring-2 focus:ring-black/5 focus:border-black focus:outline-none"
                  />
                  <span className="block mt-1.5 text-[11px] text-gray-400">
                    Time before switching to the next image.
                  </span>
                </label>
                <label className="block">
                  <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Transition Duration
                  </span>
                  <input
                    type="number"
                    min={100}
                    step={50}
                    value={durationMs}
                    onChange={(e) =>
                      setDurationMs(Number(e.target.value) || MEDIA_GALLERY_DURATION_MS)
                    }
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 focus:ring-2 focus:ring-black/5 focus:border-black focus:outline-none"
                  />
                  <span className="block mt-1.5 text-[11px] text-gray-400">
                    Fade uses a continuous crossfade without empty gap between images.
                  </span>
                </label>
              </div>

              <div className="text-sm text-gray-500">
                {activeCount} image{activeCount > 1 ? 's' : ''} active{activeCount > 1 ? 's' : ''}{' '}
                sur {items.length}
              </div>

              {items.length === 0 ? (
                <div className="border-2 border-dashed border-gray-300 rounded-3xl p-10 text-center bg-white text-gray-500">
                  Upload images to start your gallery.
                </div>
              ) : (
                <Reorder.Group
                  axis="y"
                  values={items}
                  onReorder={setItems}
                  className="flex flex-col gap-4"
                >
                  {items.map((item, index) => (
                    <SortableCard
                      key={item.id}
                      item={item}
                      index={index}
                      onRemove={() => removeItem(index)}
                      onToggle={() => toggleItem(index)}
                    />
                  ))}
                </Reorder.Group>
              )}
            </motion.div>

            <div className="px-6 py-5 border-t border-gray-100 bg-white flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={activeCount === 0}
                onClick={() => {
                  onSave(
                    syncMediaGalleryBlock(
                      block,
                      items,
                      transition || 'fade',
                      intervalMs,
                      durationMs
                    )
                  );
                  onClose();
                }}
                className="px-4 py-2.5 rounded-xl bg-gray-900 text-white font-semibold hover:bg-black disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Apply gallery
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MediaGalleryModal;
