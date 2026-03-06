import type { NextApiRequest, NextApiResponse } from 'next';
import {
  createCustomDomainForOwner,
  getCustomDomainInstructions,
  listCustomDomainsForOwner,
} from '../../../services/server/customDomainStore';
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
    const bentoId = typeof req.query.bentoId === 'string' ? req.query.bentoId.trim() : undefined;
    const items = await listCustomDomainsForOwner(user.id, bentoId);
    return res.status(200).json({ ok: true, items });
  }

  if (req.method === 'POST') {
    const domain = typeof req.body?.domain === 'string' ? req.body.domain : '';
    const bentoId = typeof req.body?.bentoId === 'string' ? req.body.bentoId : '';
    if (!domain || !bentoId) {
      return res.status(400).json({ ok: false, error: 'Missing domain or bentoId' });
    }
    try {
      const record = await createCustomDomainForOwner(user.id, bentoId, domain);
      const instructions = getCustomDomainInstructions(record.domain, record.verificationToken);
      return res.status(200).json({ ok: true, record, instructions });
    } catch (error: any) {
      const message =
        typeof error?.message === 'string' ? error.message : 'Failed to create domain';
      return res.status(400).json({ ok: false, error: message });
    }
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ ok: false, error: 'Method not allowed' });
}
