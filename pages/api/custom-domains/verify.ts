import type { NextApiRequest, NextApiResponse } from 'next';
import {
  getCustomDomainInstructions,
  verifyCustomDomainForOwner,
} from '../../../services/server/customDomainStore';
import { resolveFrvUserFromRequest } from '../../../services/server/frvAuthUser';

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

  const id = typeof req.body?.id === 'number' ? req.body.id : Number(req.body?.id);
  if (!id || Number.isNaN(id)) {
    return res.status(400).json({ ok: false, error: 'Missing custom domain id' });
  }

  try {
    const record = await verifyCustomDomainForOwner(user.id, id);
    const instructions = getCustomDomainInstructions(record.domain, record.verificationToken);
    return res.status(200).json({ ok: true, record, instructions });
  } catch (error: any) {
    const message = typeof error?.message === 'string' ? error.message : 'Failed to verify domain';
    return res.status(400).json({ ok: false, error: message });
  }
}
