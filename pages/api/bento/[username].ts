import type { NextApiRequest, NextApiResponse } from 'next';
import {
  getBentoByUsername,
  saveBentoForUsername,
  deleteBentoByUsername,
} from '../../../services/server/bentoStore';
import { verifyFrvAccessToken } from '../../../services/server/frvtubersAuth';
import type { SavedBento } from '../../../types';

const requireAuth = process.env.FRVTUBERS_API_BASE_URL?.trim() ? true : false;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const raw = typeof req.query.username === 'string' ? req.query.username : '';
  const username = raw.trim();

  if (!username) {
    return res.status(400).json({ ok: false, error: 'Missing username' });
  }

  if (req.method === 'GET') {
    const record = getBentoByUsername(username);
    if (!record) return res.status(404).json({ ok: false, error: 'Not found' });
    return res.status(200).json({ ok: true, record });
  }

  if (req.method === 'PUT') {
    if (requireAuth) {
      const auth = req.headers.authorization?.trim() || '';
      const token = auth.startsWith('Bearer ') ? auth.slice('Bearer '.length).trim() : '';
      if (!token) {
        return res.status(401).json({ ok: false, error: 'Missing access token' });
      }
      const verified = await verifyFrvAccessToken(token);
      if (!verified.ok) {
        return res
          .status(401)
          .json({ ok: false, error: verified.error, details: verified.payload });
      }
    }

    const bento = req.body?.bento as SavedBento | undefined;
    if (!bento) {
      return res.status(400).json({ ok: false, error: 'Missing bento data' });
    }
    const record = saveBentoForUsername(username, bento);
    return res.status(200).json({ ok: true, record });
  }

  if (req.method === 'DELETE') {
    if (requireAuth) {
      const auth = req.headers.authorization?.trim() || '';
      const token = auth.startsWith('Bearer ') ? auth.slice('Bearer '.length).trim() : '';
      if (!token) {
        return res.status(401).json({ ok: false, error: 'Missing access token' });
      }
      const verified = await verifyFrvAccessToken(token);
      if (!verified.ok) {
        return res
          .status(401)
          .json({ ok: false, error: verified.error, details: verified.payload });
      }
    }

    const deleted = deleteBentoByUsername(username);
    if (!deleted) return res.status(404).json({ ok: false, error: 'Not found' });
    return res.status(200).json({ ok: true });
  }

  res.setHeader('Allow', 'GET, PUT, DELETE');
  return res.status(405).json({ ok: false, error: 'Method not allowed' });
}
