import type { NextApiRequest, NextApiResponse } from 'next';
import sharp from 'sharp';

type RequestBody = {
  dataUrl?: string;
  maxWidth?: number;
  maxHeight?: number;
  maxBytes?: number;
};

const parseDataUrl = (dataUrl: string) => {
  const match = dataUrl.match(/^data:(.*?);base64,(.*)$/);
  if (!match) return null;
  return { mime: match[1], base64: match[2] };
};

const bufferToDataUrl = (buffer: Buffer, mime: string) =>
  `data:${mime};base64,${buffer.toString('base64')}`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const body = req.body as RequestBody;
    const dataUrl = body?.dataUrl;
    if (!dataUrl || typeof dataUrl !== 'string') {
      res.status(400).json({ error: 'Missing dataUrl' });
      return;
    }

    const parsed = parseDataUrl(dataUrl);
    if (!parsed || parsed.mime !== 'image/gif') {
      res.status(400).json({ error: 'Only GIF input is supported' });
      return;
    }

    const maxWidth = typeof body.maxWidth === 'number' ? body.maxWidth : 1920;
    const maxHeight = typeof body.maxHeight === 'number' ? body.maxHeight : 1080;
    const maxBytes = typeof body.maxBytes === 'number' ? body.maxBytes : 1_500_000;

    const input = Buffer.from(parsed.base64, 'base64');
    let pipeline = sharp(input, { animated: true, limitInputPixels: false });
    const metadata = await pipeline.metadata();
    const didResize =
      typeof metadata.width === 'number' &&
      typeof metadata.height === 'number' &&
      (metadata.width > maxWidth || metadata.height > maxHeight);

    if (didResize) {
      pipeline = pipeline.resize({
        width: maxWidth,
        height: maxHeight,
        fit: 'inside',
        withoutEnlargement: true,
      });
    }

    const qualities = [80, 70, 60, 50];
    let didAdjustQuality = false;
    let output: Buffer | null = null;

    for (const quality of qualities) {
      const candidate = await pipeline
        .webp({ quality, effort: 4, loop: 0, nearLossless: false })
        .toBuffer();
      if (candidate.length <= maxBytes || quality === qualities[qualities.length - 1]) {
        output = candidate;
        didAdjustQuality = quality !== qualities[0];
        break;
      }
    }

    if (!output) {
      res.status(500).json({ error: 'Conversion failed' });
      return;
    }

    res.status(200).json({
      dataUrl: bufferToDataUrl(output, 'image/webp'),
      didResize,
      didAdjustQuality,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Conversion failed';
    res.status(500).json({ error: message });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};
