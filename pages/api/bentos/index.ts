import type { NextApiRequest, NextApiResponse } from 'next';
import {
  createBentoForOwner,
  createBentoFromJsonForOwner,
  listBentosForOwner,
} from '../../../services/server/bentoStore';
import { resolveFrvUserFromRequest } from '../../../services/server/frvAuthUser';

const requireAuth = !!(
  process.env.FRVTUBERS_AUTH_ORIGIN?.trim() || process.env.FRVTUBERS_API_BASE_URL?.trim()
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await resolveFrvUserFromRequest(req, requireAuth);
  if (!user) {
    return res.status(401).json({ ok: false, error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    const items = await listBentosForOwner(user.id);
    return res.status(200).json({ ok: true, items });
  }

  if (req.method === 'POST') {
    const body = req.body || {};
    const name = typeof body.name === 'string' ? body.name.trim() : undefined;
    let template: any = null;
    if (body.bentoJson) {
      if (typeof body.bentoJson === 'object') {
        template = body.bentoJson;
      } else if (typeof body.bentoJson === 'string') {
        try {
          template = JSON.parse(body.bentoJson);
        } catch {
          template = null;
        }
      }
    }

    try {
      const bento = template
        ? await createBentoFromJsonForOwner(user, template)
        : await createBentoForOwner(user, { name });
      return res.status(200).json({ ok: true, bento });
    } catch (error: any) {
      const message = typeof error?.message === 'string' ? error.message : 'Failed to create bento';
      return res.status(500).json({ ok: false, error: message });
    }
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ ok: false, error: 'Method not allowed' });
}
