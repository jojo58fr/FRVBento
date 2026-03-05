import { SavedBento, SiteData, BlockData, UserProfile } from '../types';
import { resolveImageSrc } from '../utils/imageData';

const CACHE_KEY = 'frvbento_bentos_cache';
const ACTIVE_BENTO_KEY = 'frvbento_active_bento';
const ASSETS_KEY = 'openbento_assets';
const INITIALIZED_KEY = 'openbento_initialized';
export const GRID_VERSION = 2;

// Asset type for uploaded images
export interface Asset {
  id: string;
  name: string;
  type: string; // 'image/png', 'image/jpeg', etc.
  data: string; // base64 data URL
  createdAt: number;
}

// Bento JSON format (for export/import)
export interface BentoJSON {
  id: string;
  name: string;
  version: string;
  profile: UserProfile;
  blocks: BlockData[];
  gridVersion?: number;
  exportedAt?: number;
}

const readCache = (): SavedBento[] => {
  try {
    const stored = localStorage.getItem(CACHE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch {
    return [];
  }
};

const writeCache = (bentos: SavedBento[]): void => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(bentos));
  } catch {
    // ignore cache errors
  }
};

const updateCacheItem = (bento: SavedBento): void => {
  const items = readCache();
  const index = items.findIndex((b) => b.id === bento.id);
  if (index >= 0) {
    items[index] = bento;
  } else {
    items.push(bento);
  }
  writeCache(items);
};

const removeCacheItem = (id: string): void => {
  const items = readCache().filter((b) => b.id !== id);
  writeCache(items);
};

const fetchJson = async <T>(input: RequestInfo, init?: RequestInit): Promise<T> => {
  const res = await fetch(input, init);
  if (!res.ok) {
    if (res.status === 413) {
      throw new Error(
        'Bento trop lourd (images/base64). Réduis ou compresse les images, ou utilise des URLs.'
      );
    }
    if (res.status === 401) {
      throw new Error('Non connecté. Connecte-toi pour sauvegarder ton bento.');
    }
    const errorText = await res.text().catch(() => '');
    throw new Error(errorText || `Request failed (${res.status})`);
  }
  return (await res.json()) as T;
};

// ============ BENTO STORAGE (REMOTE + READ-ONLY CACHE) ============

export const getAllBentos = async (): Promise<SavedBento[]> => {
  try {
    const data = await fetchJson<{ ok: boolean; items: SavedBento[] }>('/api/bentos', {
      headers: { Accept: 'application/json' },
    });
    if (Array.isArray(data.items)) {
      writeCache(data.items);
      return data.items;
    }
  } catch {
    // ignore and fallback to cache
  }
  return readCache();
};

export const getBento = async (id: string): Promise<SavedBento | null> => {
  if (!id) return null;
  try {
    const data = await fetchJson<{ ok: boolean; bento: SavedBento }>(
      `/api/bentos/${encodeURIComponent(id)}`,
      { headers: { Accept: 'application/json' } }
    );
    if (data?.bento) {
      updateCacheItem(data.bento);
      return data.bento;
    }
  } catch {
    // ignore and fallback to cache
  }
  return readCache().find((b) => b.id === id) || null;
};

export const createBentoFromJSON = async (
  template: BentoJSON
): Promise<SavedBento> => {
  const data = await fetchJson<{ ok: boolean; bento: SavedBento }>('/api/bentos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bentoJson: template }),
  });
  updateCacheItem(data.bento);
  setActiveBentoId(data.bento.id);
  return data.bento;
};

export const createBento = async (name: string): Promise<SavedBento> => {
  const data = await fetchJson<{ ok: boolean; bento: SavedBento }>('/api/bentos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  updateCacheItem(data.bento);
  setActiveBentoId(data.bento.id);
  return data.bento;
};

export const deleteBento = async (id: string): Promise<void> => {
  await fetchJson('/api/bentos/' + encodeURIComponent(id), {
    method: 'DELETE',
  });
  removeCacheItem(id);
  if (getActiveBentoId() === id) {
    localStorage.removeItem(ACTIVE_BENTO_KEY);
  }
};

export const getActiveBentoId = (): string | null => {
  try {
    return localStorage.getItem(ACTIVE_BENTO_KEY);
  } catch {
    return null;
  }
};

export const setActiveBentoId = (id: string): void => {
  try {
    localStorage.setItem(ACTIVE_BENTO_KEY, id);
  } catch {
    // ignore
  }
};

export const isInitialized = (): boolean => {
  try {
    return localStorage.getItem(INITIALIZED_KEY) === 'true';
  } catch {
    return false;
  }
};

export const setInitialized = (): void => {
  try {
    localStorage.setItem(INITIALIZED_KEY, 'true');
  } catch {
    // ignore
  }
};

export const getOrCreateActiveBento = async (): Promise<SavedBento> => {
  const activeId = getActiveBentoId();

  if (activeId) {
    const bento = await getBento(activeId);
    if (bento) return bento;
  }

  const bentos = await getAllBentos();
  if (bentos.length > 0) {
    setActiveBentoId(bentos[0].id);
    return bentos[0];
  }

  return createBento('My First Bento');
};

export const initializeApp = async (): Promise<SavedBento> => {
  const activeId = getActiveBentoId();

  if (activeId) {
    const bento = await getBento(activeId);
    if (bento) return bento;
  }

  const bentos = await getAllBentos();
  if (bentos.length > 0) {
    setActiveBentoId(bentos[0].id);
    return bentos[0];
  }

  return createBento('My First Bento');
};

export const updateBentoData = async (id: string, data: SiteData): Promise<SavedBento | null> => {
  const result = await updateBentoDataWithResult(id, data);
  return result.bento;
};

export interface UpdateBentoResult {
  bento: SavedBento | null;
  error?: string;
}

export const updateBentoDataWithResult = async (
  id: string,
  data: SiteData
): Promise<UpdateBentoResult> => {
  try {
    const res = await fetchJson<{ ok: boolean; bento: SavedBento }>(
      `/api/bentos/${encodeURIComponent(id)}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data }),
      }
    );
    updateCacheItem(res.bento);
    return { bento: res.bento };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Request failed';
    console.error('updateBentoData failed:', { id, message, error });
    return { bento: null, error: message };
  }
};

export const renameBento = async (id: string, newName: string): Promise<SavedBento | null> => {
  try {
    const res = await fetchJson<{ ok: boolean; bento: SavedBento }>(
      `/api/bentos/${encodeURIComponent(id)}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName }),
      }
    );
    updateCacheItem(res.bento);
    return res.bento;
  } catch {
    return null;
  }
};

// ============ EXPORT / IMPORT ============

export const exportBentoToJSON = (bento: SavedBento): BentoJSON => {
  const profile = bento.data.profile;
  const normalizedProfile: UserProfile = {
    ...profile,
    avatarUrl: resolveImageSrc(profile.avatarUrl) || '',
    backgroundImage: resolveImageSrc(profile.backgroundImage),
    openGraph: profile.openGraph
      ? { ...profile.openGraph, image: resolveImageSrc(profile.openGraph.image) }
      : undefined,
  };
  const normalizedBlocks: BlockData[] = bento.data.blocks.map((block) => ({
    ...block,
    imageUrl: resolveImageSrc(block.imageUrl),
  }));

  return {
    id: bento.id,
    name: bento.name,
    version: '1.0',
    profile: normalizedProfile,
    blocks: normalizedBlocks,
    gridVersion: bento.data.gridVersion ?? GRID_VERSION,
    exportedAt: Date.now(),
  };
};

export const downloadBentoJSON = (bento: SavedBento): void => {
  const json = exportBentoToJSON(bento);
  const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `${bento.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const importBentoFromJSON = async (json: BentoJSON): Promise<SavedBento> => {
  return createBentoFromJSON(json);
};

export const loadBentoFromFile = (file: File): Promise<SavedBento> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const json = JSON.parse(e.target?.result as string) as BentoJSON;
        const bento = await importBentoFromJSON(json);
        resolve(bento);
      } catch {
        reject(new Error('Invalid JSON file'));
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

// ============ ASSETS STORAGE ============

export const getAssets = (): Asset[] => {
  try {
    const stored = localStorage.getItem(ASSETS_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch {
    return [];
  }
};

export const saveAssets = (assets: Asset[]): void => {
  try {
    localStorage.setItem(ASSETS_KEY, JSON.stringify(assets));
  } catch (e) {
    console.error('Failed to save assets:', e);
  }
};

export const addAsset = (name: string, type: string, data: string): Asset => {
  const asset: Asset = {
    id: `asset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    type,
    data,
    createdAt: Date.now(),
  };

  const assets = getAssets();
  assets.push(asset);
  saveAssets(assets);

  return asset;
};

export const removeAsset = (id: string): void => {
  const assets = getAssets().filter((a) => a.id !== id);
  saveAssets(assets);
};

export const exportAssetsJSON = (): { version: string; lastUpdated: number; assets: Asset[] } => {
  return {
    version: '1.0',
    lastUpdated: Date.now(),
    assets: getAssets(),
  };
};

export const downloadAssetsJSON = (): void => {
  const json = exportAssetsJSON();
  const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'assets.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const clearAllData = (): void => {
  try {
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(ACTIVE_BENTO_KEY);
    localStorage.removeItem(ASSETS_KEY);
    localStorage.removeItem(INITIALIZED_KEY);
  } catch {
    // ignore
  }
};
