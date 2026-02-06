import type { GetServerSideProps } from 'next';
import BentoRender from '../components/BentoRender';
import type { SavedBento } from '../types';
import { getBentoByUsername } from '../services/server/bentoStore';

interface PublicBentoProps {
  username: string;
  bento: SavedBento;
}

export default function PublicBentoPage({ bento }: PublicBentoProps) {
  return <BentoRender bento={bento} />;
}

export const getServerSideProps: GetServerSideProps<PublicBentoProps> = async (ctx) => {
  const username = typeof ctx.params?.username === 'string' ? ctx.params.username : '';
  const record = username ? getBentoByUsername(username) : null;

  if (!record) {
    return { notFound: true };
  }

  return {
    props: {
      username: record.username,
      bento: record.bento,
    },
  };
};
