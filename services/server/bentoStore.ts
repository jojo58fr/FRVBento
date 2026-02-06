import fs from 'node:fs';
import path from 'node:path';
import type { SavedBento } from '../../types';

export interface BentoRecord {
  username: string;
  bento: SavedBento;
  createdAt: number;
  updatedAt: number;
}

interface StoreShape {
  version: number;
  items: Record<string, BentoRecord>;
}

const STORE_PATH = path.join(process.cwd(), 'data', 'bentos.json');

const readStore = (): StoreShape => {
  try {
    const raw = fs.readFileSync(STORE_PATH, 'utf8');
    const parsed = JSON.parse(raw) as StoreShape;
    if (!parsed?.items || typeof parsed.version !== 'number') {
      return { version: 1, items: {} };
    }
    return parsed;
  } catch {
    return { version: 1, items: {} };
  }
};

const writeStore = (store: StoreShape) => {
  fs.mkdirSync(path.dirname(STORE_PATH), { recursive: true });
  fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2));
};

export const getBentoByUsername = (username: string): BentoRecord | null => {
  const store = readStore();
  return store.items[username.toLowerCase()] ?? null;
};

export const saveBentoForUsername = (username: string, bento: SavedBento): BentoRecord => {
  const store = readStore();
  const key = username.toLowerCase();
  const now = Date.now();
  const existing = store.items[key];
  const record: BentoRecord = {
    username,
    bento,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  store.items[key] = record;
  writeStore(store);
  return record;
};

export const deleteBentoByUsername = (username: string): boolean => {
  const store = readStore();
  const key = username.toLowerCase();
  if (!store.items[key]) return false;
  delete store.items[key];
  writeStore(store);
  return true;
};
