import React, { useEffect, useState } from 'react';
import type { SavedBento } from '../types';
import { getBento, getOrCreateActiveBento, setActiveBentoId } from '../services/storageService';
import BentoRender from './BentoRender';

const PreviewPage: React.FC = () => {
  const [bento, setBento] = useState<SavedBento | null>(null);

  useEffect(() => {
    const load = async () => {
      const params = new URLSearchParams(window.location.search);
      const requestedId = params.get('id')?.trim();
      const requested = requestedId ? await getBento(requestedId) : null;
      const resolved = requested || (await getOrCreateActiveBento());
      if (requested) setActiveBentoId(requested.id);
      setBento(resolved);
    };
    void load();
  }, []);

  if (!bento) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">
        Loading...
      </div>
    );
  }

  return <BentoRender bento={bento} />;
};

export default PreviewPage;
