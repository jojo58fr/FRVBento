import type { NextApiRequest, NextApiResponse } from 'next';

const normalizeLinktreeUrl = (input: string): string | null => {
  const trimmed = input.trim();
  if (!trimmed) return null;

  try {
    const parsed = /^https?:\/\//i.test(trimmed)
      ? new URL(trimmed)
      : new URL(`https://linktr.ee/${trimmed.replace(/^@/, '')}`);
    const hostname = parsed.hostname.toLowerCase();
    if (hostname !== 'linktr.ee' && hostname !== 'www.linktr.ee') return null;
    const username = parsed.pathname.split('/').filter(Boolean)[0];
    if (!username) return null;
    return `https://linktr.ee/${username}`;
  } catch {
    return null;
  }
};

const extractNextData = (html: string) => {
  const match = html.match(
    /<script id="__NEXT_DATA__" type="application\/json"[^>]*>([\s\S]*?)<\/script>/
  );
  if (!match) return null;

  try {
    return JSON.parse(match[1]);
  } catch {
    return null;
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ ok: false, error: 'Method not allowed.' });
  }

  const importsEnabled =
    process.env.NEXT_PUBLIC_ENABLE_IMPORT === 'true' || process.env.VITE_ENABLE_IMPORT === 'true';

  if (!importsEnabled) {
    return res.status(404).json({
      ok: false,
      error: 'Linktree import is unavailable in this environment.',
    });
  }

  const sourceUrl = normalizeLinktreeUrl(String(req.query.url || ''));
  if (!sourceUrl) {
    return res.status(400).json({ ok: false, error: 'Invalid Linktree URL.' });
  }

  try {
    const upstream = await fetch(sourceUrl, {
      headers: {
        'user-agent': 'FRVBento Linktree Import',
        accept: 'text/html,application/xhtml+xml',
      },
    });

    if (!upstream.ok) {
      return res.status(upstream.status).json({
        ok: false,
        error: `Linktree returned ${upstream.status}.`,
      });
    }

    const html = await upstream.text();
    const nextData = extractNextData(html);
    const pageProps = nextData?.props?.pageProps;

    if (!pageProps?.account) {
      return res.status(422).json({
        ok: false,
        error: 'Unable to extract importable data from this Linktree page.',
      });
    }

    return res.status(200).json({ ok: true, pageProps, sourceUrl });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: `Failed to fetch Linktree page: ${(error as Error).message}`,
    });
  }
}
