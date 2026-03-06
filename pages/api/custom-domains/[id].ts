import type { NextApiRequest, NextApiResponse } from 'next';
import { deleteCustomDomainForOwner } from '../../../services/server/customDomainStore';
import { resolveFrvUserFromRequest } from '../../../services/server/frvAuthUser';

const requireAuth = !!(
  process.env.FRVTUBERS_AUTH_ORIGIN?.trim() || process.env.FRVTUBERS_API_BASE_URL?.trim()
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const raw = typeof req.query.id === 'string' ? req.query.id : '';
  const id = Number(raw);
  if (!id || Number.isNaN(id)) {
    return res.status(400).json({ ok: false, error: 'Missing id' });
  }

  const user = await resolveFrvUserFromRequest(req, requireAuth);
  if (!user) {
    return res.status(401).json({ ok: false, error: 'Unauthorized' });
  }

  if (req.method === 'DELETE') {
    try {
      await deleteCustomDomainForOwner(user.id, id);
      return res.status(200).json({ ok: true });
    } catch (error: any) {
      const message = typeof error?.message === 'string' ? error.message : 'Failed to delete';
      return res.status(400).json({ ok: false, error: message });
    }
  }

  res.setHeader('Allow', 'DELETE');
  return res.status(405).json({ ok: false, error: 'Method not allowed' });
}
