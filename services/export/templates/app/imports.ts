/**
 * Generate import statements for the exported App.tsx
 */

export const generateImports =
  (): string => `import { useState, useEffect, useRef, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Youtube, Play, Loader2 } from 'lucide-react'
import {
  SiX, SiInstagram, SiTiktok, SiYoutube, SiGithub, SiGitlab, SiLinkedin,
  SiFacebook, SiTwitch, SiDribbble, SiMedium, SiDevdotto, SiReddit,
  SiPinterest, SiThreads, SiBluesky, SiMastodon, SiSubstack, SiPatreon,
  SiKofi, SiBuymeacoffee, SiSnapchat, SiDiscord, SiTelegram, SiWhatsapp,
} from 'react-icons/si'
import { Globe, Link as LinkIcon } from 'lucide-react'
import type { IconType } from 'react-icons'
import type { LucideIcon } from 'lucide-react'
`;
