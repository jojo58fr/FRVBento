import React, { useEffect, useMemo, useState } from 'react';
import { Loader2, Radio, Tv } from 'lucide-react';

interface TwitchStatusResponse {
  channel: string;
  isLive: boolean;
  latestVideoId?: string;
  latestVideoTitle?: string;
  streamTitle?: string;
  streamGame?: string;
}

interface TwitchPlayerEmbedProps {
  channel?: string;
  fallbackVideoId?: string;
  title?: string;
  subtext?: string;
  interactive?: boolean;
  renderIframe?: boolean;
}

const TWITCH_CLIENT_REFRESH_MS = 120000;

const normalizeTwitchChannel = (value?: string) => {
  if (!value) return '';

  const trimmed = value.trim();
  const fromUrl = trimmed.match(/twitch\.tv\/([^/?#]+)/i)?.[1];
  return (fromUrl || trimmed).replace(/^@/, '').trim().toLowerCase();
};

const normalizeTwitchVideoId = (value?: string) => {
  if (!value) return '';

  const trimmed = value.trim();
  const fromUrl = trimmed.match(/\/videos\/(\d+)/i)?.[1];
  const normalized = (fromUrl || trimmed).replace(/^v/i, '').trim();
  return /^\d+$/.test(normalized) ? normalized : '';
};

const TwitchPlayerEmbed: React.FC<TwitchPlayerEmbedProps> = ({
  channel,
  fallbackVideoId,
  title,
  subtext,
  interactive = true,
  renderIframe = true,
}) => {
  const normalizedChannel = useMemo(() => normalizeTwitchChannel(channel), [channel]);
  const manualFallbackVideoId = useMemo(
    () => normalizeTwitchVideoId(fallbackVideoId),
    [fallbackVideoId]
  );
  const [parentHost, setParentHost] = useState('localhost');
  const [status, setStatus] = useState<TwitchStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setParentHost(window.location.hostname || 'localhost');
  }, []);

  useEffect(() => {
    if (!normalizedChannel) {
      setStatus(null);
      return;
    }

    let isMounted = true;
    const controller = new AbortController();

    const loadStatus = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/twitch/status?channel=${encodeURIComponent(normalizedChannel)}`,
          {
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error('Unable to load Twitch status');
        }

        const nextStatus = (await response.json()) as TwitchStatusResponse;
        if (isMounted) {
          setStatus(nextStatus);
        }
      } catch (error) {
        if ((error as Error).name !== 'AbortError' && isMounted) {
          setStatus(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadStatus();
    const intervalId = window.setInterval(() => void loadStatus(), TWITCH_CLIENT_REFRESH_MS);

    return () => {
      isMounted = false;
      controller.abort();
      window.clearInterval(intervalId);
    };
  }, [normalizedChannel]);

  const effectiveFallbackVideoId = manualFallbackVideoId || status?.latestVideoId || '';
  const hasChannel = normalizedChannel.length > 0;
  const isLive = !!status?.isLive;
  const iframeSrc = !hasChannel
    ? ''
    : isLive
      ? `https://player.twitch.tv/?channel=${encodeURIComponent(normalizedChannel)}&parent=${encodeURIComponent(parentHost)}&muted=true`
      : effectiveFallbackVideoId
        ? `https://player.twitch.tv/?video=v${encodeURIComponent(effectiveFallbackVideoId)}&parent=${encodeURIComponent(parentHost)}&muted=true`
        : '';

  const displayTitle = status?.streamTitle || title || normalizedChannel || 'Twitch';
  const displaySubtext = isLive
    ? status?.streamGame || subtext || 'En live'
    : subtext || status?.latestVideoTitle || 'Dernier replay';

  if (!hasChannel) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-[#18181b] text-white px-4 text-center">
        <Tv size={28} className="text-[#a970ff]" />
        <p className="text-sm font-semibold">Ajoute une chaine Twitch</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative bg-[#0f0f12] overflow-hidden">
      {iframeSrc && renderIframe ? (
        <iframe
          src={iframeSrc}
          title={`Twitch player ${normalizedChannel}`}
          allowFullScreen
          scrolling="no"
          className={`w-full h-full border-0 ${interactive ? 'pointer-events-auto' : 'pointer-events-none'}`}
        />
      ) : iframeSrc ? (
        <div className="w-full h-full bg-[radial-gradient(circle_at_top,_rgba(169,112,255,0.28),_transparent_55%),linear-gradient(180deg,_#18181b_0%,_#0f0f12_100%)] flex items-end p-4">
          <div className="rounded-xl bg-black/35 border border-white/10 px-3 py-2 backdrop-blur-sm">
            <p className="text-xs font-semibold text-white">
              {isLive ? 'Live Twitch actif' : 'Replay Twitch pret'}
            </p>
            <p className="text-[11px] text-white/70 mt-1">Apercu statique dans l'editeur</p>
          </div>
        </div>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-[#18181b] text-white px-4 text-center">
          {isLoading ? (
            <Loader2 size={28} className="animate-spin text-[#a970ff]" />
          ) : (
            <Tv size={28} className="text-[#a970ff]" />
          )}
          <p className="text-sm font-semibold">
            {isLoading ? 'Chargement Twitch…' : 'Aucune video Twitch disponible'}
          </p>
        </div>
      )}

      <div className="absolute inset-x-0 top-0 flex items-center justify-between gap-3 p-3 bg-gradient-to-b from-black/70 to-transparent pointer-events-none">
        <div className="min-w-0">
          <p className="text-[11px] md:text-xs font-bold text-white truncate">{displayTitle}</p>
          <p className="text-[10px] md:text-[11px] text-white/70 truncate">{displaySubtext}</p>
        </div>
        <div
          className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${
            isLive ? 'bg-red-500 text-white' : 'bg-white/15 text-white'
          }`}
        >
          <Radio size={10} />
          {isLive ? 'Live' : 'Replay'}
        </div>
      </div>
    </div>
  );
};

export default TwitchPlayerEmbed;
