import type { NextApiRequest, NextApiResponse } from 'next';
import { saveBentoForUsername } from '../../../services/server/bentoStore';
import { verifyFrvAccessToken } from '../../../services/server/frvtubersAuth';
import type { SavedBento } from '../../../types';

const requireAuth = process.env.FRVTUBERS_API_BASE_URL?.trim() ? true : false;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  if (requireAuth) {
    const auth = req.headers.authorization?.trim() || '';
    const token = auth.startsWith('Bearer ') ? auth.slice('Bearer '.length).trim() : '';
    if (!token) {
      return res.status(401).json({ ok: false, error: 'Missing access token' });
    }
    const verified = await verifyFrvAccessToken(token);
    if (!verified.ok) {
      return res.status(401).json({ ok: false, error: verified.error, details: verified.payload });
    }
  }

  const username = typeof req.body?.username === 'string' ? req.body.username.trim() : '';
  const bento = req.body?.bento as SavedBento | undefined;

  if (!username || !bento) {
    return res.status(400).json({ ok: false, error: 'Missing username or bento data' });
  }

  const record = saveBentoForUsername(username, bento);
  const baseUrl = process.env.PUBLIC_BASE_URL?.trim() || '';
  const publicUrl = `${baseUrl.replace(/\/$/, '')}/${record.username}`;

  return res.status(200).json({ ok: true, record, publicUrl });
}
