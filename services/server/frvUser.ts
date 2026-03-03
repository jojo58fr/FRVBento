export interface FrvUserIdentity {
  id: string;
  discordId?: string;
  username?: string;
  displayName?: string;
}

const normalizeId = (value: unknown): string | null => {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return null;
};

const readUserObject = (payload: any): any => {
  if (!payload || typeof payload !== 'object') return null;
  if (payload.user && typeof payload.user === 'object') return payload.user;
  if (payload.session?.user && typeof payload.session.user === 'object') return payload.session.user;
  if (payload.data?.user && typeof payload.data.user === 'object') return payload.data.user;
  return null;
};

const readNestedDiscordId = (user: any): string | null => {
  const direct = normalizeId(user?.discordId);
  if (direct) return direct;
  const nested = normalizeId(user?.discord?.id);
  if (nested) return nested;
  const provider = normalizeId(user?.providerAccountId);
  if (provider) return provider;
  return null;
};

export const extractFrvUser = (payload: unknown): FrvUserIdentity | null => {
  const user = readUserObject(payload);
  if (!user) return null;

  const id =
    normalizeId(user.id) ||
    normalizeId(user.userId) ||
    normalizeId(user.uid) ||
    normalizeId((payload as any)?.userId);
  if (!id) return null;

  const discordId = readNestedDiscordId(user) || normalizeId((payload as any)?.discordId) || undefined;
  const username =
    (typeof user.username === 'string' && user.username.trim()) ? user.username.trim() :
    (typeof user.login === 'string' && user.login.trim()) ? user.login.trim() :
    (typeof user.handle === 'string' && user.handle.trim()) ? user.handle.trim() :
    undefined;
  const displayName =
    (typeof user.displayName === 'string' && user.displayName.trim()) ? user.displayName.trim() :
    (typeof user.name === 'string' && user.name.trim()) ? user.name.trim() :
    username;

  return { id, discordId: discordId || undefined, username, displayName };
};

