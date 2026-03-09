import { randomUUID } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { Prisma } from '@prisma/client';
import type { SavedBento, SiteData, BlockData, UserProfile } from '../../types';
import { AVATAR_PLACEHOLDER } from '../../constants';
import { prisma } from './prisma';
import type { FrvUserIdentity } from './frvUser';

export interface BentoRecord {
  username: string;
  bento: SavedBento;
  createdAt: number;
  updatedAt: number;
}

export interface OwnedBento extends SavedBento {
  publishedSlug?: string | null;
}

interface BentoTemplate {
  name?: string;
  profile?: UserProfile;
  blocks?: BlockData[];
  gridVersion?: number;
}

const GRID_VERSION = 2;

const generateId = () => randomUUID();

const sanitizeBento = (bento: SavedBento): SavedBento => {
  const copy = { ...bento } as SavedBento & Record<string, unknown>;
  delete copy.publishedSlug;
  delete copy.isPublished;
  return copy;
};

const normalizeBento = (bento: SavedBento, fallbackId?: string): SavedBento => {
  const now = Date.now();
  return {
    ...bento,
    id: bento.id?.trim() || fallbackId || generateId(),
    createdAt: bento.createdAt || now,
    updatedAt: now,
  };
};

const normalizeProfile = (profile?: UserProfile): UserProfile => ({
  name: profile?.name || 'My Bento',
  bio: profile?.bio || 'Digital creator & developer.\nBuilding awesome things.',
  avatarUrl: profile?.avatarUrl || AVATAR_PLACEHOLDER,
  pageLayout: profile?.pageLayout,
  theme: profile?.theme || 'light',
  primaryColor: profile?.primaryColor || 'blue',
  customCss: profile?.customCss || '',
  publicSlug: profile?.publicSlug || '',
  showBranding: profile?.showBranding ?? true,
  analytics: profile?.analytics || { enabled: false, supabaseUrl: '' },
  socialAccounts: profile?.socialAccounts || [],
  avatarStyle: profile?.avatarStyle,
  showSocialInHeader: profile?.showSocialInHeader,
  showFollowerCount: profile?.showFollowerCount,
  backgroundColor: profile?.backgroundColor,
  backgroundImage: profile?.backgroundImage,
  backgroundBlur: profile?.backgroundBlur,
  openGraph: profile?.openGraph,
});

const normalizeBlocks = (blocks?: BlockData[]): BlockData[] =>
  (blocks || []).map((block) => ({
    ...block,
    id: block.id?.trim() || generateId(),
  }));

const buildBentoFromTemplate = (template: BentoTemplate, nameOverride?: string): SavedBento => {
  const now = Date.now();
  const profile = normalizeProfile(template.profile);
  const blocks = normalizeBlocks(template.blocks);
  const name = nameOverride?.trim() || template.name || profile.name || 'My Bento';

  return {
    id: generateId(),
    name,
    createdAt: now,
    updatedAt: now,
    data: {
      gridVersion: template.gridVersion ?? GRID_VERSION,
      profile: { ...profile, name },
      blocks,
    },
  };
};

const loadDefaultTemplate = async (): Promise<BentoTemplate | null> => {
  try {
    const filePath = path.join(process.cwd(), 'public', 'bentos', 'default.json');
    const raw = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(raw) as BentoTemplate;
  } catch {
    return null;
  }
};

const applyUserUpdates = async (
  user: FrvUserIdentity,
  existing: {
    id: string;
    discordId: string | null;
    username: string | null;
    displayName: string | null;
  }
) => {
  const updates: Record<string, string | null> = {};
  if (user.discordId && !existing.discordId) {
    const conflict = await prisma.user.findUnique({ where: { discordId: user.discordId } });
    if (!conflict) updates.discordId = user.discordId;
  }
  if (user.username && user.username !== existing.username) updates.username = user.username;
  if (user.displayName && user.displayName !== existing.displayName) {
    updates.displayName = user.displayName;
  }
  if (Object.keys(updates).length > 0) {
    await prisma.user.update({ where: { id: existing.id }, data: updates });
  }
  return existing;
};

const ensureUser = async (user: FrvUserIdentity) => {
  const existing = await prisma.user.findUnique({ where: { id: user.id } });

  if (existing) {
    return applyUserUpdates(user, existing);
  }

  const createData: {
    id: string;
    discordId?: string;
    username?: string;
    displayName?: string;
  } = {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
  };

  if (user.discordId) {
    const conflict = await prisma.user.findUnique({ where: { discordId: user.discordId } });
    if (!conflict) createData.discordId = user.discordId;
  }

  try {
    return await prisma.user.create({ data: createData });
  } catch (error) {
    if (error instanceof Error && 'code' in error && (error as { code?: string }).code === 'P2002') {
      const fallback = await prisma.user.findUnique({ where: { id: user.id } });
      if (fallback) {
        return applyUserUpdates(user, fallback);
      }
    }
    throw error;
  }
};

const mapBentoRecord = (record: {
  id: string;
  data: unknown;
  createdAt: Date;
  updatedAt: Date;
  published?: { slug: string } | null;
}): OwnedBento => {
  const raw = record.data as SavedBento;
  return {
    ...raw,
    id: record.id,
    createdAt: raw?.createdAt || record.createdAt.getTime(),
    updatedAt: raw?.updatedAt || record.updatedAt.getTime(),
    publishedSlug: record.published?.slug || null,
  };
};

export const listBentosForOwner = async (ownerId: string): Promise<OwnedBento[]> => {
  const records = await prisma.bento.findMany({
    where: { ownerId },
    include: { published: true },
    orderBy: { updatedAt: 'desc' },
  });
  return records.map(mapBentoRecord);
};

export const getBentoForOwner = async (
  ownerId: string,
  id: string
): Promise<OwnedBento | null> => {
  const record = await prisma.bento.findFirst({
    where: { id, ownerId },
    include: { published: true },
  });
  if (!record) return null;
  return mapBentoRecord(record);
};

export const createBentoForOwner = async (
  owner: FrvUserIdentity,
  options?: { name?: string; template?: BentoTemplate }
): Promise<OwnedBento> => {
  await ensureUser(owner);
  const template = options?.template || (await loadDefaultTemplate()) || {};
  const bento = buildBentoFromTemplate(template, options?.name);
  const sanitized = sanitizeBento(bento);

  const saved = await prisma.bento.create({
    data: {
      id: sanitized.id,
      ownerId: owner.id,
      data: sanitized as unknown as Prisma.InputJsonValue,
    },
    include: { published: true },
  });
  return mapBentoRecord(saved);
};

export const createBentoFromJsonForOwner = async (
  owner: FrvUserIdentity,
  template: BentoTemplate
): Promise<OwnedBento> => {
  await ensureUser(owner);
  const bento = buildBentoFromTemplate(template);
  const sanitized = sanitizeBento(bento);
  const saved = await prisma.bento.create({
    data: {
      id: sanitized.id,
      ownerId: owner.id,
      data: sanitized as unknown as Prisma.InputJsonValue,
    },
    include: { published: true },
  });
  return mapBentoRecord(saved);
};

export const updateBentoForOwner = async (
  ownerId: string,
  id: string,
  updates: { name?: string; data?: SiteData }
): Promise<OwnedBento | null> => {
  const existing = await prisma.bento.findFirst({ where: { id, ownerId } });
  if (!existing) return null;

  const current = existing.data as unknown as SavedBento;
  const now = Date.now();
  const next: SavedBento = {
    ...current,
    id,
    name: updates.name?.trim() || current.name,
    data: updates.data ? { ...updates.data } : current.data,
    updatedAt: now,
    createdAt: current.createdAt || existing.createdAt.getTime(),
  };

  const sanitized = sanitizeBento(next);
  const saved = await prisma.bento.update({
    where: { id },
    data: { data: sanitized as unknown as Prisma.InputJsonValue },
    include: { published: true },
  });
  return mapBentoRecord(saved);
};

export const deleteBentoForOwner = async (ownerId: string, id: string): Promise<boolean> => {
  const existing = await prisma.bento.findFirst({ where: { id, ownerId } });
  if (!existing) return false;
  await prisma.bento.delete({ where: { id } });
  return true;
};

export const getBentoByUsername = async (username: string): Promise<BentoRecord | null> => {
  const key = username.toLowerCase();
  const published = await prisma.publishedBento.findUnique({
    where: { slug: key },
    include: { bento: true },
  });
  if (!published) return null;
  if (!published.bento) {
    try {
      await prisma.publishedBento.delete({ where: { slug: key } });
    } catch {
      // ignore cleanup errors
    }
    return null;
  }
  return {
    username: published.slug,
    bento: published.bento.data as unknown as SavedBento,
    createdAt: published.createdAt.getTime(),
    updatedAt: published.bento.updatedAt.getTime(),
  };
};

export const saveBentoForUsername = async (
  username: string,
  bento: SavedBento,
  owner?: FrvUserIdentity
): Promise<BentoRecord> => {
  const key = username.toLowerCase();
  const resolvedId = bento.id?.trim() || generateId();
  const normalized = normalizeBento(sanitizeBento(bento), resolvedId);

  let ownerId: string | null = null;
  if (owner) {
    await ensureUser(owner);
    ownerId = owner.id;
  } else {
    const fallback = { id: 'public', displayName: 'Public' } as FrvUserIdentity;
    await ensureUser(fallback);
    ownerId = fallback.id;
  }

  const existingBento = await prisma.bento.findUnique({ where: { id: resolvedId } });
  if (existingBento && ownerId && existingBento.ownerId !== ownerId) {
    throw new Error('Bento belongs to another user');
  }

  const savedBento = await prisma.bento.upsert({
    where: { id: resolvedId },
    update: { data: normalized as unknown as Prisma.InputJsonValue },
    create: {
      id: resolvedId,
      data: normalized as unknown as Prisma.InputJsonValue,
      ownerId: ownerId || existingBento?.ownerId || 'public',
    },
  });

  if (ownerId && savedBento.ownerId !== ownerId) {
    await prisma.bento.update({ where: { id: savedBento.id }, data: { ownerId } });
  }

  const existing = await prisma.publishedBento.findUnique({ where: { slug: key } });
  if (existing && existing.bentoId !== resolvedId) {
    throw new Error('Slug already assigned to another bento');
  }

  const published = await prisma.publishedBento.upsert({
    where: { slug: key },
    update: { bentoId: resolvedId },
    create: { slug: key, bentoId: resolvedId },
  });

  return {
    username: published.slug,
    bento: savedBento.data as unknown as SavedBento,
    createdAt: published.createdAt.getTime(),
    updatedAt: savedBento.updatedAt.getTime(),
  };
};

export const deleteBentoByUsername = async (
  username: string,
  ownerId?: string
): Promise<boolean> => {
  const key = username.toLowerCase();
  const published = await prisma.publishedBento.findUnique({ where: { slug: key } });
  if (!published) return false;

  if (ownerId) {
    const bento = await prisma.bento.findUnique({ where: { id: published.bentoId } });
    if (!bento || bento.ownerId !== ownerId) {
      throw new Error('Bento belongs to another user');
    }
  }

  await prisma.publishedBento.delete({ where: { slug: key } });

  const stillPublished = await prisma.publishedBento.findFirst({
    where: { bentoId: published.bentoId },
    select: { id: true },
  });
  if (!stillPublished) {
    try {
      await prisma.bento.delete({ where: { id: published.bentoId } });
    } catch {
      // ignore if already deleted
    }
  }
  return true;
};
