import React, { useState } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import {
  Github,
  ArrowRight,
  Zap,
  Shield,
  ChevronRight,
  Download,
  BarChart3,
  Layers,
  Grid3X3,
  Palette,
  Sparkles,
  Globe,
  BookOpen,
} from 'lucide-react';
import BlockPreview from './BlockPreview';
import { BlockData, BlockType } from '../types';

interface LandingPageProps {
  onStart: () => void;
}

// Demo blocks for the hero preview
const demoBlocks: BlockData[] = [
  {
    id: 'demo-1',
    type: BlockType.SOCIAL,
    title: 'Twitch',
    subtext: 'Live now',
    colSpan: 3,
    rowSpan: 3,
    gridColumn: 1,
    gridRow: 1,
    color: 'bg-purple-600',
    textColor: 'text-white',
    socialPlatform: 'twitch',
    socialHandle: 'frv_vtuber',
  },
  {
    id: 'demo-2',
    type: BlockType.YOUTUBE,
    title: 'YouTube',
    subtext: 'Latest cover',
    content: 'https://www.youtube.com',
    colSpan: 3,
    rowSpan: 3,
    gridColumn: 4,
    gridRow: 1,
    color: 'bg-red-500',
    textColor: 'text-white',
  },
  {
    id: 'demo-3',
    type: BlockType.TEXT,
    title: 'Lore',
    content: 'Vtuber cyber-angel · streams Wed/Sat · FR/EN',
    colSpan: 3,
    rowSpan: 3,
    gridColumn: 7,
    gridRow: 1,
    color: 'bg-amber-100',
    textColor: 'text-gray-900',
  },
  {
    id: 'demo-4',
    type: BlockType.SOCIAL,
    title: 'X',
    subtext: '@frv_vtuber',
    colSpan: 3,
    rowSpan: 3,
    gridColumn: 1,
    gridRow: 4,
    color: 'bg-black',
    textColor: 'text-white',
    socialPlatform: 'x',
    socialHandle: 'frv_vtuber',
  },
  {
    id: 'demo-5',
    type: BlockType.LINK,
    title: 'Merch',
    subtext: 'Nouvelles drops',
    content: 'https://example.com',
    colSpan: 3,
    rowSpan: 3,
    gridColumn: 4,
    gridRow: 4,
    color: 'bg-white',
    textColor: 'text-gray-900',
  },
  {
    id: 'demo-6',
    type: BlockType.SOCIAL,
    title: 'Discord',
    subtext: 'Communauté',
    colSpan: 3,
    rowSpan: 3,
    gridColumn: 7,
    gridRow: 4,
    color: 'bg-indigo-500',
    textColor: 'text-white',
    socialPlatform: 'discord',
    socialHandle: 'frv_vtuber',
  },
];

const basePath = (process.env.NEXT_PUBLIC_BASE_PATH || '').replace(/\/$/, '');

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  const [isDark, setIsDark] = useState(false);
  return (
    <div
      className={`min-h-screen font-sans selection:bg-black selection:text-white overflow-x-hidden ${
        isDark ? 'bg-[#0b0b0f] text-gray-100 landing-dark' : 'bg-[#F9F7F4] text-gray-900'
      }`}
    >
      <Head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css"
        />
      </Head>
      {isDark && (
        <style>{`
          .landing-dark .text-gray-900 { color: #f3f4f6 !important; }
          .landing-dark .text-gray-800 { color: #e5e7eb !important; }
          .landing-dark .text-gray-700 { color: #d1d5db !important; }
          .landing-dark .text-gray-600 { color: #cbd5f5 !important; }
          .landing-dark .text-gray-500 { color: #a1a1aa !important; }
          .landing-dark .text-gray-400 { color: #71717a !important; }
          .landing-dark .bg-white { background-color: #0f1117 !important; }
          .landing-dark .bg-gray-50 { background-color: #0b0b0f !important; }
          .landing-dark .bg-gray-100 { background-color: #141824 !important; }
          .landing-dark .bg-gray-200 { background-color: #1f2430 !important; }
          .landing-dark .border-gray-100 { border-color: #1f2430 !important; }
          .landing-dark .border-gray-200 { border-color: #2a3142 !important; }
          .landing-dark .border-gray-300 { border-color: #374151 !important; }
          .landing-dark .shadow-sm { box-shadow: 0 1px 2px rgba(0,0,0,0.4) !important; }
          .landing-dark .shadow-md { box-shadow: 0 6px 16px rgba(0,0,0,0.45) !important; }
          .landing-dark .shadow-xl { box-shadow: 0 20px 40px rgba(0,0,0,0.5) !important; }
        `}</style>
      )}
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div
            className={`backdrop-blur rounded-2xl border shadow-sm px-4 py-3 flex items-center justify-between ${
              isDark ? 'bg-gray-900/80 border-gray-800' : 'bg-white/90 border-gray-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gray-900 text-white rounded-xl flex items-center justify-center font-bold text-sm shadow-sm">
                FR
              </div>
              <span className="font-bold text-lg tracking-tight">FRVBento</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsDark((prev) => !prev)}
                className={`hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  isDark
                    ? 'bg-gray-800 text-gray-100 hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                aria-pressed={isDark}
                aria-label="Toggle theme"
              >
                <i className={isDark ? 'fa-solid fa-moon' : 'fa-regular fa-sun'} />
              </button>
              <a
                href={`${basePath}/doc`}
                target="_blank"
                rel="noopener noreferrer"
                className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  isDark
                    ? 'text-gray-300 hover:text-white hover:bg-gray-800'
                    : 'text-gray-600 hover:text-black hover:bg-gray-100'
                }`}
              >
                <BookOpen size={18} />
                <span>Docs</span>
              </a>
              <button
                onClick={onStart}
                className="bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-black transition-all shadow-md hover:shadow-lg flex items-center gap-2"
              >
                Créer mon bento <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-36 pb-20 px-6 relative">
        {/* Decorative elements */}
        <div
          className={`absolute top-10 left-8 w-72 h-72 rounded-full blur-[130px] opacity-40 ${
            isDark ? 'bg-purple-700/40' : 'bg-rose-200'
          }`}
        />
        <div
          className={`absolute top-40 right-10 w-96 h-96 rounded-full blur-[130px] opacity-30 ${
            isDark ? 'bg-amber-500/30' : 'bg-amber-200'
          }`}
        />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 0.8, 0.25, 1] }}
          >
            <div
              className={`inline-flex items-center gap-3 px-5 py-2.5 rounded-full border text-sm font-medium mb-6 shadow-sm ${
                isDark
                  ? 'bg-gray-900 border-gray-800 text-gray-200'
                  : 'bg-white border-gray-200 text-gray-700'
              }`}
            >
              <Sparkles size={16} className="text-amber-500" />
              <span>Le bento open-source pensé pour les VTubers</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.05] mb-8">
              <span className="text-gray-900">Un lien unique</span>
              <br />
              <span className="relative">
                pour tout ton contenu
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                  <path
                    d="M2 10C50 2 150 2 298 10"
                    stroke="#F97316"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <span className="text-gray-900">, sans dépendre d’une plateforme fermée.</span>
            </h1>

            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-10">
              FRVBento te permet de créer un bento clair et beau pour Twitch, YouTube, merch, dons,
              réseaux sociaux et agenda de stream. Hébergé pour toi à{' '}
              <span className="font-semibold text-gray-900">bento.frvtubers.com/tonpseudo</span>,
              avec export possible si tu veux l’auto‑héberger.
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <button
              onClick={onStart}
              className="group h-14 px-8 rounded-2xl bg-gray-900 text-white font-semibold text-lg flex items-center gap-3 hover:bg-black transition-all shadow-xl hover:shadow-2xl hover:scale-[1.02]"
            >
              Créer mon bento
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                <ArrowRight size={18} />
              </div>
            </button>
            <a
              href={`${basePath}/preview`}
              target="_blank"
              rel="noreferrer"
              className="h-14 px-8 rounded-2xl bg-white border border-gray-200 text-gray-700 font-semibold text-lg flex items-center gap-3 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
            >
              <Globe size={20} className="text-amber-500" />
              Voir un exemple
            </a>
          </motion.div>

          {/* Hero Preview */}
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.25, 0.8, 0.25, 1] }}
            className="relative max-w-4xl mx-auto"
          >
            {/* Browser Frame */}
            <div
              className={`rounded-[28px] p-1 shadow-2xl border ${
                isDark ? 'bg-gray-900 border-gray-800' : 'bg-gray-200 border-gray-200'
              }`}
            >
              <div className="bg-white rounded-[24px] overflow-hidden">
                {/* Browser Bar */}
                <div className="bg-gray-50 px-4 py-3 flex items-center gap-3 border-b border-gray-100">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="bg-gray-100 rounded-lg px-4 py-1.5 text-sm text-gray-600 font-mono">
                      bento.frvtubers.com/tonpseudo
                    </div>
                  </div>
                </div>

                {/* Preview Content - Real Bento Grid */}
                <div
                  className={`p-4 md:p-6 min-h-[350px] ${
                    isDark ? 'bg-[#0f1117]' : 'bg-[#FAFAFA]'
                  }`}
                >
                  <div
                    className="grid gap-2 w-full h-full"
                    style={{
                      gridTemplateColumns: 'repeat(9, 1fr)',
                      gridTemplateRows: 'repeat(6, 1fr)',
                      minHeight: '300px',
                    }}
                  >
                    {demoBlocks.map((block) => (
                      <BlockPreview
                        key={block.id}
                        block={block}
                        enableTiltEffect={false}
                        onClickBlock={() => {}}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* VTuber Platforms */}
      <section className="py-16 border-y border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-sm font-medium text-gray-400 uppercase tracking-wider mb-8">
            Pensé pour les créateurs VTubers
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            {['Twitch', 'YouTube', 'TikTok', 'X', 'Discord', 'Ko‑fi', 'Patreon', 'Streamlabs'].map(
              (platform, i) => (
                <span
                  key={i}
                  className="text-xl font-bold text-gray-300 hover:text-gray-500 transition-colors"
                >
                  {platform}
                </span>
              )
            )}
          </div>
        </div>
      </section>

      {/* FRV Features */}
      <section className={`py-20 px-6 ${isDark ? 'bg-[#141018]' : 'bg-[#FFF7ED]'}`}>
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-sm font-semibold text-orange-600 uppercase tracking-wider">
              FRVBento
            </span>
            <h2 className="text-4xl font-bold tracking-tight mt-3 mb-4">
              Ton bento public, géré pour toi
            </h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              Tu crées une page unique qui centralise tous tes liens. FRVBento s’occupe de
              l’hébergement et des mises à jour — pas besoin de déploiement manuel (sauf mode expert).
            </p>
            <div className="flex flex-wrap gap-3">
              {[
                'URL publique automatique',
                'Mises à jour instantanées',
                'Connexion via FRVtubers',
                'Export possible en React/Vite',
              ].map((item) => (
                <span
                  key={item}
                  className="px-3 py-1.5 bg-white border border-orange-200 text-sm font-medium rounded-full text-orange-800"
                >
                  {item}
                </span>
              ))}
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white rounded-3xl border border-orange-100 shadow-xl p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-700 flex items-center justify-center">
                <Globe size={22} />
              </div>
              <div>
                <h4 className="font-bold text-gray-900">bento.frvtubers.com/tonpseudo</h4>
                <p className="text-xs text-gray-500">URL publique prête à partager</p>
              </div>
            </div>
            <div className="space-y-4 text-sm text-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-orange-500" />
                Twitch, YouTube, TikTok, réseaux, dons, merch
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-orange-500" />
                Avatar, couleurs, fonds, gradients, animations
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-orange-500" />
                Respect de la vie privée, open‑source, MIT
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Block Types Section */}
      <section className={`py-24 px-6 ${isDark ? 'bg-[#0f1117]' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-sm font-semibold text-violet-600 uppercase tracking-wider">
                Blocks
              </span>
              <h2 className="text-4xl font-bold tracking-tight mt-3 mb-4">
                Tout ce qu’un VTuber doit partager
              </h2>
              <p className="text-gray-500 max-w-xl mx-auto">
                Mélange les blocks pour créer une page claire, stylée et adaptée à ton univers.
              </p>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: '🔗', title: 'Liens', desc: 'Titres + sous‑textes clairs' },
              { icon: '🖼️', title: 'Médias', desc: 'Images & GIFs optimisés' },
              { icon: '📺', title: 'YouTube', desc: 'Vidéo unique ou grille' },
              { icon: '📝', title: 'Texte', desc: 'Bio, lore, infos stream' },
              { icon: '🌐', title: 'Réseaux', desc: '26+ plateformes' },
              { icon: '📍', title: 'Map', desc: 'Localisation ou events' },
              { icon: '⬜', title: 'Spacer', desc: 'Respiration visuelle' },
            ].map((block, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="bg-white p-6 rounded-2xl border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all"
              >
                <div className="text-2xl mb-3">{block.icon}</div>
                <h3 className="text-lg font-bold mb-1">{block.title}</h3>
                <p className="text-gray-500 text-sm">{block.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className={`py-24 px-6 ${isDark ? 'bg-[#0b0b0f]' : ''}`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-sm font-semibold text-purple-600 uppercase tracking-wider">
                Fonctionnalités
              </span>
              <h2 className="text-4xl font-bold tracking-tight mt-3 mb-4">
                Simple, puissant, libre
              </h2>
              <p className="text-gray-500 max-w-xl mx-auto">
                Le meilleur du builder OpenBento, avec l’hébergement FRVBento.
              </p>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <Grid3X3 size={24} />,
                title: 'Drag & drop visuel',
                desc: 'Grille 9×9. Drag, resize, et prévisualisation instantanée.',
                bg: 'bg-pink-50',
                border: 'border-pink-100',
                iconBg: 'bg-pink-100',
                iconColor: 'text-pink-600',
                darkBg: 'bg-[#14161f]',
                darkBorder: 'border-gray-800',
                darkIconBg: 'bg-[#20192a]',
                darkIconColor: 'text-pink-300',
              },
              {
                icon: <Palette size={24} />,
                title: 'Personnalisation complète',
                desc: 'Couleurs, gradients, fonds, avatars (formes, bordures, ombres).',
                bg: 'bg-violet-50',
                border: 'border-violet-100',
                iconBg: 'bg-violet-100',
                iconColor: 'text-violet-600',
                darkBg: 'bg-[#14161f]',
                darkBorder: 'border-gray-800',
                darkIconBg: 'bg-[#1b1a2b]',
                darkIconColor: 'text-violet-300',
              },
              {
                icon: <Globe size={24} />,
                title: 'Publication hébergée',
                desc: 'Ton bento en ligne sur une URL publique — sans déployer.',
                bg: 'bg-amber-50',
                border: 'border-amber-100',
                iconBg: 'bg-amber-100',
                iconColor: 'text-amber-700',
                darkBg: 'bg-[#14161f]',
                darkBorder: 'border-gray-800',
                darkIconBg: 'bg-[#231f14]',
                darkIconColor: 'text-amber-300',
              },
              {
                icon: <Download size={24} />,
                title: 'Export libre',
                desc: 'Télécharge un projet React/Vite/Tailwind si tu veux l’auto‑héberger.',
                bg: 'bg-blue-50',
                border: 'border-blue-100',
                iconBg: 'bg-blue-100',
                iconColor: 'text-blue-600',
                darkBg: 'bg-[#14161f]',
                darkBorder: 'border-gray-800',
                darkIconBg: 'bg-[#162032]',
                darkIconColor: 'text-blue-300',
              },
              {
                icon: <Shield size={24} />,
                title: 'Privacy‑first',
                desc: 'Open‑source, MIT, pas de revente de données.',
                bg: 'bg-emerald-50',
                border: 'border-emerald-100',
                iconBg: 'bg-emerald-100',
                iconColor: 'text-emerald-600',
                darkBg: 'bg-[#14161f]',
                darkBorder: 'border-gray-800',
                darkIconBg: 'bg-[#14261f]',
                darkIconColor: 'text-emerald-300',
              },
              {
                icon: <Layers size={24} />,
                title: 'Plusieurs bentos',
                desc: 'Crée plusieurs pages pour collabs, événements, saisons.',
                bg: 'bg-gray-50',
                border: 'border-gray-200',
                iconBg: 'bg-gray-100',
                iconColor: 'text-gray-600',
                darkBg: 'bg-[#10131a]',
                darkBorder: 'border-gray-800',
                darkIconBg: 'bg-[#1a1f2b]',
                darkIconColor: 'text-gray-200',
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`p-8 rounded-3xl border hover:shadow-lg transition-all group ${
                  isDark ? `${feature.darkBg} ${feature.darkBorder}` : `${feature.bg} ${feature.border}`
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                    isDark
                      ? `${feature.darkIconBg} ${feature.darkIconColor}`
                      : `${feature.iconBg} ${feature.iconColor}`
                  }`}
                >
                  {feature.icon}
                </div>
                <h3
                  className={`text-xl font-bold mb-2 transition-colors ${
                    isDark ? 'text-gray-100 group-hover:text-white' : 'text-gray-900 group-hover:text-gray-900'
                  }`}
                >
                  {feature.title}
                </h3>
                <p className={`leading-relaxed text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Analytics Section */}
      <section
        className={`py-24 px-6 ${
          isDark ? 'bg-gradient-to-br from-[#141019] to-[#0f1117]' : 'bg-gradient-to-br from-amber-50 to-rose-50'
        }`}
      >
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-sm font-semibold text-orange-600 uppercase tracking-wider">
                Analytics optionnel
              </span>
              <h2 className="text-4xl font-bold tracking-tight mt-3 mb-4">
                Suivi des clics, sans trackers
              </h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                Active les analytics si tu veux suivre tes performances. Basé sur Supabase, 100%
                sous ton contrôle.
              </p>
              <ul className="space-y-3">
                {[
                  'Vues et clics par bloc',
                  'Aucune pub, aucun cookie tiers',
                  'Self‑hosted sur ton Supabase',
                  'Dashboard admin inclus',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-700">
                    <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center">
                      <Zap size={12} className="text-orange-600" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                    <BarChart3 size={20} className="text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Performance</h4>
                    <p className="text-xs text-gray-500">30 derniers jours</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-3xl font-bold text-gray-900">3 214</p>
                      <p className="text-sm text-gray-500">Vues</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-emerald-600">+18%</p>
                      <p className="text-xs text-gray-400">vs mois dernier</p>
                    </div>
                  </div>
                  <div className="h-24 flex items-end gap-1">
                    {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 100].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-orange-200 rounded-t"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Social Platforms */}
      <section
        className={`py-20 px-6 border-y ${isDark ? 'bg-[#0f1117] border-gray-800' : 'bg-white border-gray-100'}`}
      >
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider">
              Réseaux & plateformes
            </span>
            <h2 className="text-3xl font-bold tracking-tight mt-3 mb-4">
              Plus de 26 plateformes supportées
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto mb-8">
              Rassemble tout ton écosystème sur une seule page.
            </p>
          </motion.div>

          <div className="flex flex-wrap items-center justify-center gap-3 text-gray-400">
            {[
              'Twitch',
              'YouTube',
              'TikTok',
              'X',
              'Discord',
              'Instagram',
              'Patreon',
              'Ko‑fi',
              'Spotify',
              'Kick',
              'Threads',
              'Bluesky',
              'Mastodon',
              'Telegram',
              'PayPal',
              'Streamlabs',
              'StreamElements',
              'Reddit',
              'Pinterest',
              'Substack',
            ].map((platform, i) => (
              <span
                key={i}
                className="px-3 py-1.5 bg-gray-50 rounded-full text-sm font-medium border border-gray-100"
              >
                {platform}
              </span>
            ))}
            <span className="px-3 py-1.5 bg-gray-900 text-white rounded-full text-sm font-medium">
              + liens custom
            </span>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 px-6 bg-gray-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500 rounded-full blur-[150px]" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500 rounded-full blur-[150px]" />
        </div>

        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-purple-400 uppercase tracking-wider">
              Comment ça marche
            </span>
            <h2 className="text-4xl font-bold tracking-tight mt-3">Prêt en 4 étapes</h2>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: '01',
                title: 'Connecte‑toi',
                desc: 'Via ton compte FRVtubers',
              },
              {
                step: '02',
                title: 'Crée',
                desc: 'Glisse, ajuste, personnalise',
              },
              {
                step: '03',
                title: 'Publie',
                desc: 'URL publique instantanée',
              },
              {
                step: '04',
                title: 'Partage',
                desc: 'Un seul lien partout',
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="text-center"
              >
                <div className="text-6xl font-bold text-white/10 mb-4">{item.step}</div>
                <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                <p className="text-gray-400">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className={`py-16 px-6 border-b ${isDark ? 'bg-[#0f1117] border-gray-800' : 'bg-gray-50 border-gray-100'}`}>
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-6">
            Stack technique
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
            {[
              { name: 'React', color: 'text-cyan-600' },
              { name: 'Vite', color: 'text-purple-600' },
              { name: 'TypeScript', color: 'text-blue-600' },
              { name: 'Tailwind CSS', color: 'text-sky-500' },
              { name: 'Lucide Icons', color: 'text-amber-600' },
              { name: 'React Icons', color: 'text-pink-600' },
            ].map((tech, i) => (
              <span key={i} className={`text-lg font-bold ${tech.color}`}>
                {tech.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-6 relative">
        <div className={`absolute inset-0 ${isDark ? 'bg-[#0b0b0f]' : 'bg-gray-50'}`} />

        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
              Prêt à créer ton bento VTuber ?
            </h2>
            <p className="text-xl text-gray-500 mb-10">
              Gratuit, open‑source, et pensé pour les créateurs. Publie en un clic (ou exporte si tu es en mode expert et que tu souhaites un url différent).
            </p>
            <button
              onClick={onStart}
              className="group h-16 px-10 rounded-2xl bg-gray-900 text-white font-semibold text-xl hover:bg-black transition-all shadow-2xl hover:shadow-3xl hover:scale-[1.02] inline-flex items-center gap-3"
            >
              Commencer maintenant
              <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="mt-6 text-sm text-gray-400">
              Free forever · Open‑source · MIT
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`py-12 border-t ${isDark ? 'border-gray-800 bg-[#0f1117]' : 'border-gray-100 bg-white'}`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-900 text-white rounded-lg flex items-center justify-center font-bold text-sm">
                FR
              </div>
              <span className="font-semibold">FRVBento</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <a
                href={`${basePath}/doc`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-black transition-colors flex items-center gap-2"
              >
                <BookOpen size={16} /> Docs
              </a>
              <span className="flex items-center gap-2">
                <Github size={16} /> Fork OpenBento
              </span>
              <span>&copy; {new Date().getFullYear()} FRVBento</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
