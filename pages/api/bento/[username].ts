import type { NextApiRequest, NextApiResponse } from 'next';
import {
  getBentoByUsername,
  saveBentoForUsername,
  deleteBentoByUsername,
} from '../../../services/server/bentoStore';
import { resolveFrvUserFromRequest } from '../../../services/server/frvAuthUser';
import type { SavedBento } from '../../../types';

const requireAuth = !!(
  process.env.FRVTUBERS_AUTH_ORIGIN?.trim() || process.env.FRVTUBERS_API_BASE_URL?.trim()
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const raw = typeof req.query.username === 'string' ? req.query.username : '';
  const username = raw.trim();

  if (!username) {
    return res.status(400).json({ ok: false, error: 'Missing username' });
  }

  if (req.method === 'GET') {
    const record = await getBentoByUsername(username);
    if (!record) return res.status(404).json({ ok: false, error: 'Not found' });
    return res.status(200).json({ ok: true, record });
  }

  if (req.method === 'PUT') {
    const user = await resolveFrvUserFromRequest(req, requireAuth);
    if (!user) {
      return res.status(401).json({ ok: false, error: 'Unauthorized' });
    }

    const bento = req.body?.bento as SavedBento | undefined;
    if (!bento) {
      return res.status(400).json({ ok: false, error: 'Missing bento data' });
    }
    try {
      const record = await saveBentoForUsername(username, bento, user);
      return res.status(200).json({ ok: true, record });
    } catch (error: any) {
      const message = typeof error?.message === 'string' ? error.message : 'Failed to save bento';
      const status = message.includes('Slug already assigned')
        ? 409
        : message.includes('belongs to another user')
          ? 403
          : 500;
      return res.status(status).json({ ok: false, error: message });
    }
  }

  if (req.method === 'DELETE') {
    const user = await resolveFrvUserFromRequest(req, requireAuth);
    if (!user) {
      return res.status(401).json({ ok: false, error: 'Unauthorized' });
    }

    try {
      const deleted = await deleteBentoByUsername(username, user.id);
      if (!deleted) return res.status(404).json({ ok: false, error: 'Not found' });
      return res.status(200).json({ ok: true });
    } catch (error: any) {
      const message = typeof error?.message === 'string' ? error.message : 'Failed to delete bento';
      const status = message.includes('belongs to another user') ? 403 : 500;
      return res.status(status).json({ ok: false, error: message });
    }
  }

  res.setHeader('Allow', 'GET, PUT, DELETE');
  return res.status(405).json({ ok: false, error: 'Method not allowed' });
}
