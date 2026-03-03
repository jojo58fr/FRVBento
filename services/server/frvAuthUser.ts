import type { NextApiRequest } from 'next';
import { verifyFrvAccessToken, verifyFrvSessionFromCookie } from './frvtubersAuth';
import { extractFrvUser, type FrvUserIdentity } from './frvUser';

export const resolveFrvUserFromRequest = async (
  req: NextApiRequest,
  requireAuth: boolean
): Promise<FrvUserIdentity | null> => {
  if (!requireAuth) {
    return { id: 'public', displayName: 'Public' };
  }

  const cookieHeader = req.headers.cookie;
  const sessionCheck = await verifyFrvSessionFromCookie(cookieHeader);
  if (sessionCheck.ok && sessionCheck.payload) {
    const user = extractFrvUser(sessionCheck.payload);
    if (user) return user;
  }

  const auth = req.headers.authorization?.trim() || '';
  const token = auth.startsWith('Bearer ') ? auth.slice('Bearer '.length).trim() : '';
  if (token) {
    const verified = await verifyFrvAccessToken(token);
    if (verified.ok && verified.payload) {
      const user = extractFrvUser(verified.payload);
      if (user) return user;
    }
  }

  return null;
};

