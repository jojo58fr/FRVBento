import type { ComponentType } from 'react';
import DocIndex from './index.md';
import BuilderQuickStart from './builder/quick-start.md';
import BuilderInstallation from './builder/installation.md';
import BuilderConfiguration from './builder/configuration.md';
import BuilderDeploy from './builder/deploy.md';
import UsageQuickStart from './usage/quick-start.md';
import UsageBlocks from './usage/blocks.md';
import UsageAnalytics from './usage/analytics.md';
import ExportQuickStart from './export/quick-start.md';
import ExportOverview from './export/overview.md';
import ExportVercel from './export/vercel.md';
import ExportNetlify from './export/netlify.md';
import ExportGithubPages from './export/github-pages.md';
import ExportDocker from './export/docker.md';

interface DocEntry {
  slug: string;
  title: string;
  section?: string;
  Component: ComponentType;
}

interface DocSection {
  id: string;
  title: string;
  icon: string;
  docs: DocEntry[];
}

// Section metadata
const sectionMeta: Record<string, { title: string; icon: string; order: number }> = {
  builder: { title: 'Builder Setup', icon: '🛠️', order: 1 },
  usage: { title: 'Using the Builder', icon: '🎨', order: 2 },
  export: { title: 'Export & Deploy', icon: '🚀', order: 3 },
};

// Title overrides for specific files
const titleOverrides: Record<string, string> = {
  index: 'Introduction',
  'builder/quick-start': 'Quick Start',
  'builder/installation': 'Installation',
  'builder/configuration': 'Configuration',
  'builder/deploy': 'Deploy Builder',
  'usage/quick-start': 'Quick Start',
  'usage/blocks': 'Block Types',
  'usage/analytics': 'Analytics',
  'export/quick-start': 'Quick Start',
  'export/overview': 'Overview',
  'export/vercel': 'Vercel',
  'export/netlify': 'Netlify',
  'export/github-pages': 'GitHub Pages',
  'export/docker': 'Docker',
};

// Order within sections (lower = first)
const docOrder: Record<string, number> = {
  'builder/quick-start': 1,
  'builder/installation': 2,
  'builder/configuration': 3,
  'builder/deploy': 4,
  'usage/quick-start': 1,
  'usage/blocks': 2,
  'usage/analytics': 3,
  'export/quick-start': 1,
  'export/overview': 2,
  'export/vercel': 3,
  'export/netlify': 4,
  'export/github-pages': 5,
  'export/docker': 6,
};

// Extract title from slug
const slugToTitle = (slug: string): string => {
  if (titleOverrides[slug]) return titleOverrides[slug];
  const name = slug.split('/').pop() || slug;
  if (name === 'index') return 'Introduction';
  return name
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Build the flat manifest from static imports
export const docsManifest: DocEntry[] = [
  { slug: 'index', title: slugToTitle('index'), Component: DocIndex },
  { slug: 'builder/quick-start', title: slugToTitle('builder/quick-start'), section: 'builder', Component: BuilderQuickStart },
  { slug: 'builder/installation', title: slugToTitle('builder/installation'), section: 'builder', Component: BuilderInstallation },
  { slug: 'builder/configuration', title: slugToTitle('builder/configuration'), section: 'builder', Component: BuilderConfiguration },
  { slug: 'builder/deploy', title: slugToTitle('builder/deploy'), section: 'builder', Component: BuilderDeploy },
  { slug: 'usage/quick-start', title: slugToTitle('usage/quick-start'), section: 'usage', Component: UsageQuickStart },
  { slug: 'usage/blocks', title: slugToTitle('usage/blocks'), section: 'usage', Component: UsageBlocks },
  { slug: 'usage/analytics', title: slugToTitle('usage/analytics'), section: 'usage', Component: UsageAnalytics },
  { slug: 'export/quick-start', title: slugToTitle('export/quick-start'), section: 'export', Component: ExportQuickStart },
  { slug: 'export/overview', title: slugToTitle('export/overview'), section: 'export', Component: ExportOverview },
  { slug: 'export/vercel', title: slugToTitle('export/vercel'), section: 'export', Component: ExportVercel },
  { slug: 'export/netlify', title: slugToTitle('export/netlify'), section: 'export', Component: ExportNetlify },
  { slug: 'export/github-pages', title: slugToTitle('export/github-pages'), section: 'export', Component: ExportGithubPages },
  { slug: 'export/docker', title: slugToTitle('export/docker'), section: 'export', Component: ExportDocker },
].sort((a, b) => {
  // Sort: index first, then by section order, then by doc order
  if (a.slug === 'index') return -1;
  if (b.slug === 'index') return 1;

  const aSection = a.section || '';
  const bSection = b.section || '';

  if (aSection !== bSection) {
    const aOrder = sectionMeta[aSection]?.order ?? 99;
    const bOrder = sectionMeta[bSection]?.order ?? 99;
    return aOrder - bOrder;
  }

  // Sort within section by docOrder
  const aDocOrder = docOrder[a.slug] ?? 99;
  const bDocOrder = docOrder[b.slug] ?? 99;
  return aDocOrder - bDocOrder;
});

// Build sections for sidebar
export const docsSections: DocSection[] = (() => {
  const sections: DocSection[] = [];
  const sectionMap = new Map<string, DocEntry[]>();

  for (const doc of docsManifest) {
    if (!doc.section) continue;
    if (!sectionMap.has(doc.section)) {
      sectionMap.set(doc.section, []);
    }
    sectionMap.get(doc.section)!.push(doc);
  }

  for (const [sectionId, docs] of sectionMap) {
    const meta = sectionMeta[sectionId];
    if (meta) {
      sections.push({
        id: sectionId,
        title: meta.title,
        icon: meta.icon,
        docs,
      });
    }
  }

  return sections.sort((a, b) => {
    const aOrder = sectionMeta[a.id]?.order ?? 99;
    const bOrder = sectionMeta[b.id]?.order ?? 99;
    return aOrder - bOrder;
  });
})();

// Helper to find a doc by slug
export const getDocBySlug = (slug: string): DocEntry | undefined => {
  return docsManifest.find((doc) => doc.slug === slug);
};

// Helper to get the index doc
export const getIndexDoc = (): DocEntry | undefined => {
  return docsManifest.find((doc) => doc.slug === 'index');
};
