import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import LandingPage from './components/LandingPage';
import { motion, AnimatePresence } from 'framer-motion';
import { useFrvAuth } from './hooks/useFrvAuth';

const ENABLE_LANDING = process.env.NEXT_PUBLIC_ENABLE_LANDING === 'true';

// Builder is client-only since it relies heavily on browser APIs
const LazyBuilder = dynamic(() => import('./components/Builder'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center text-gray-400">
      Loading...
    </div>
  ),
});

function MainApp() {
  const { enabled, loading, isAuthenticated, hasVtuberRole, logout } = useFrvAuth();
  const [page, setPage] = useState<'landing' | 'builder'>(ENABLE_LANDING ? 'landing' : 'builder');

  if (enabled && loading) {
    return (
      <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center text-gray-500">
        Chargement...
      </div>
    );
  }

  if (enabled && isAuthenticated && hasVtuberRole === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0b0b0f] via-[#141824] to-[#1f2937] text-gray-100 flex items-center justify-center px-6">
        <div className="max-w-xl w-full bg-[#0f1117]/80 border border-[#2a3142] rounded-3xl p-8 shadow-2xl">
          <div className="text-xs uppercase tracking-widest text-amber-400 font-semibold">
            Accès limité
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mt-3">
            Désolé, FRVBento n&apos;est disponible que pour ceux ayant le rôle VtuberFR
            (hasVtuberRole) sur le discord de FRVtubers.
          </h1>
          <p className="text-gray-300 mt-4">
            Rejoins le serveur pour obtenir le rôle :
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href="https://discord.gg/meyHQYWvjU"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center px-5 py-3 rounded-2xl bg-amber-500 text-gray-900 font-semibold hover:bg-amber-400 transition-colors"
            >
              Rejoindre le Discord FRVtubers
            </a>
            <button
              type="button"
              onClick={() => void logout()}
              className="inline-flex items-center justify-center px-5 py-3 rounded-2xl border border-gray-600 text-gray-100 font-semibold hover:bg-gray-800 transition-colors"
            >
              Se déconnecter
            </button>
          </div>

          <div className="mt-6 rounded-2xl border border-[#2a3142] bg-[#0b0d12] p-5">
            <p className="text-sm uppercase tracking-widest text-emerald-400 font-semibold">
              Tu veux quand même tester l&apos;outil ?
            </p>
            <p className="text-gray-300 mt-2">
              Test OpenBento ! C&apos;est exactement la même solution sans l&apos;hébergement et
              gratuit à tous !
            </p>
            <a
              href="https://yoanbernabeu.github.io/openbento/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center mt-4 px-4 py-2 rounded-xl bg-emerald-400 text-gray-900 font-semibold hover:bg-emerald-300 transition-colors"
            >
              Tester OpenBento
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (!ENABLE_LANDING) {
    return <LazyBuilder />;
  }

  return (
    <AnimatePresence mode="wait">
      {page === 'landing' ? (
        <motion.div
          key="landing"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <LandingPage onStart={() => setPage('builder')} />
        </motion.div>
      ) : (
        <motion.div
          key="builder"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.4 }}
        >
          <LazyBuilder onBack={() => setPage('landing')} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default MainApp;
