import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyFrvSessionFromCookie } from '../../../../services/server/frvtubersAuth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const cookieHeader = req.headers.cookie;
  const sessionCheck = await verifyFrvSessionFromCookie(cookieHeader);
  if (!sessionCheck.ok) {
    return res.status(401).json({ ok: false, error: sessionCheck.error });
  }

  return res.status(200).json(sessionCheck.payload ?? null);
}
