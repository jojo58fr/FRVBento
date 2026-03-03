import type { NextApiRequest, NextApiResponse } from 'next';
import { saveBentoForUsername } from '../../../services/server/bentoStore';
import { resolveFrvUserFromRequest } from '../../../services/server/frvAuthUser';
import type { SavedBento } from '../../../types';

const requireAuth = !!(
  process.env.FRVTUBERS_AUTH_ORIGIN?.trim() || process.env.FRVTUBERS_API_BASE_URL?.trim()
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const user = await resolveFrvUserFromRequest(req, requireAuth);
  if (!user) {
    return res.status(401).json({ ok: false, error: 'Unauthorized' });
  }

  const username = typeof req.body?.username === 'string' ? req.body.username.trim() : '';
  const bento = req.body?.bento as SavedBento | undefined;

  if (!username || !bento) {
    return res.status(400).json({ ok: false, error: 'Missing username or bento data' });
  }

  try {
    const record = await saveBentoForUsername(username, bento, user);
    const baseUrl = process.env.PUBLIC_BASE_URL?.trim() || '';
    const publicUrl = `${baseUrl.replace(/\/$/, '')}/${record.username}`;

    return res.status(200).json({ ok: true, record, publicUrl });
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
