import type { NextApiRequest, NextApiResponse } from 'next';
import {
  deleteBentoForOwner,
  getBentoForOwner,
  updateBentoForOwner,
} from '../../../services/server/bentoStore';
import { resolveFrvUserFromRequest } from '../../../services/server/frvAuthUser';
import type { SiteData } from '../../../types';

const requireAuth = !!(
  process.env.FRVTUBERS_AUTH_ORIGIN?.trim() || process.env.FRVTUBERS_API_BASE_URL?.trim()
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const raw = typeof req.query.id === 'string' ? req.query.id : '';
  const id = raw.trim();
  if (!id) return res.status(400).json({ ok: false, error: 'Missing id' });

  const user = await resolveFrvUserFromRequest(req, requireAuth);
  if (!user) {
    return res.status(401).json({ ok: false, error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    const bento = await getBentoForOwner(user.id, id);
    if (!bento) return res.status(404).json({ ok: false, error: 'Not found' });
    return res.status(200).json({ ok: true, bento });
  }

  if (req.method === 'PUT') {
    const body = req.body || {};
    const name = typeof body.name === 'string' ? body.name.trim() : undefined;
    const data = body.data as SiteData | undefined;
    if (!name && !data) {
      return res.status(400).json({ ok: false, error: 'Missing update data' });
    }

    const updated = await updateBentoForOwner(user.id, id, { name, data });
    if (!updated) return res.status(404).json({ ok: false, error: 'Not found' });
    return res.status(200).json({ ok: true, bento: updated });
  }

  if (req.method === 'DELETE') {
    const deleted = await deleteBentoForOwner(user.id, id);
    if (!deleted) return res.status(404).json({ ok: false, error: 'Not found' });
    return res.status(200).json({ ok: true });
  }

  res.setHeader('Allow', 'GET, PUT, DELETE');
  return res.status(405).json({ ok: false, error: 'Method not allowed' });
}

