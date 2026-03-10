import type { NextApiRequest, NextApiResponse } from 'next';

const TWITCH_WEB_CLIENT_ID = 'kimne78kx3ncx6brgo4mv6wki5h1ko';

const normalizeTwitchChannel = (value: string) => {
  const trimmed = value.trim();
  const fromUrl = trimmed.match(/twitch\.tv\/([^/?#]+)/i)?.[1];
  return (fromUrl || trimmed).replace(/^@/, '').trim().toLowerCase();
};

interface TwitchGraphQlResponse {
  data?: {
    user?: {
      login: string;
      stream: {
        id: string;
        title: string;
        game?: { name?: string | null } | null;
      } | null;
      videos?: {
        edges?: Array<{
          node?: {
            id?: string | null;
            title?: string | null;
          } | null;
        }>;
      } | null;
    } | null;
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const channelParam = Array.isArray(req.query.channel) ? req.query.channel[0] : req.query.channel;
  const channel = normalizeTwitchChannel(channelParam || '');

  if (!channel) {
    res.status(400).json({ error: 'Missing channel' });
    return;
  }

  try {
    const response = await fetch('https://gql.twitch.tv/gql', {
      method: 'POST',
      headers: {
        'Client-ID': TWITCH_WEB_CLIENT_ID,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        operationName: 'ChannelShell',
        query:
          'query ChannelShell($login: String!) { user(login: $login) { login stream { id title game { name } } videos(first: 1, sort: TIME) { edges { node { id title } } } } }',
        variables: { login: channel },
      }),
    });

    if (!response.ok) {
      throw new Error(`Twitch request failed with ${response.status}`);
    }

    const payload = (await response.json()) as TwitchGraphQlResponse;
    const user = payload.data?.user;
    const latestVideo = user?.videos?.edges?.[0]?.node;

    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    res.status(200).json({
      channel,
      isLive: !!user?.stream,
      latestVideoId: latestVideo?.id || undefined,
      latestVideoTitle: latestVideo?.title || undefined,
      streamTitle: user?.stream?.title || undefined,
      streamGame: user?.stream?.game?.name || undefined,
    });
  } catch (error) {
    console.error('Twitch status error:', error);
    res.status(500).json({ error: 'Unable to fetch Twitch status', channel });
  }
}
