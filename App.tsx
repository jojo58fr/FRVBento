import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import LandingPage from './components/LandingPage';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [page, setPage] = useState<'landing' | 'builder'>(ENABLE_LANDING ? 'landing' : 'builder');

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
