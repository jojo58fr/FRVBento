import type { GetServerSideProps } from 'next';
import MainApp from '../App';
import BentoRender from '../components/BentoRender';
import type { SavedBento } from '../types';
import { getBentoByCustomDomain } from '../services/server/customDomainStore';

interface HomePageProps {
  customBento?: SavedBento | null;
}

export default function HomePage({ customBento }: HomePageProps) {
  if (customBento) return <BentoRender bento={customBento} />;
  return <MainApp />;
}

const shouldSkipCustomDomain = (host: string): boolean => {
  const normalized = host.toLowerCase();
  if (!normalized) return true;
  if (normalized.includes('localhost')) return true;
  if (normalized === '127.0.0.1') return true;
  if (normalized.endsWith('frvtubers.com')) return true;
  const baseUrl = process.env.PUBLIC_BASE_URL?.trim();
  if (baseUrl) {
    try {
      const baseHost = new URL(baseUrl).hostname.toLowerCase();
      if (normalized === baseHost) return true;
    } catch {
      // ignore
    }
  }
  return false;
};

export const getServerSideProps: GetServerSideProps<HomePageProps> = async (ctx) => {
  const hostHeader = ctx.req.headers.host || '';
  const host = hostHeader.split(':')[0].toLowerCase();
  if (shouldSkipCustomDomain(host)) {
    return { props: {} };
  }

  const record = await getBentoByCustomDomain(host);
  if (!record) {
    return { props: {} };
  }

  return {
    props: {
      customBento: record.bento,
    },
  };
};
