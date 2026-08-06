import { BookOpen, GraduationCap, HelpCircle, Settings } from 'lucide-react';

import type { DocNavItem, DocSection } from '../types';

export const docSections: DocSection[] = [
  {
    id: 'getting-started',
    titleKey: 'docs.nav.gettingStarted',
    icon: BookOpen,
    pages: [
      { slug: 'getting-started', titleKey: 'docs.nav.welcome', order: 1 },
      { slug: 'getting-started/first-login', titleKey: 'docs.nav.firstLogin', order: 2 },
      { slug: 'getting-started/navigation', titleKey: 'docs.nav.navigation', order: 3 },
      { slug: 'getting-started/profile-setup', titleKey: 'docs.nav.profileSetup', order: 4 },
    ],
  },
  {
    id: 'member',
    titleKey: 'docs.nav.memberGuide',
    icon: GraduationCap,
    pages: [
      { slug: 'member', titleKey: 'docs.nav.overview', order: 1 },
      { slug: 'member/dashboard', titleKey: 'docs.nav.dashboard', order: 2 },
      { slug: 'member/profile-settings', titleKey: 'docs.nav.profileSettings', order: 3 },
      { slug: 'member/ai-assistant', titleKey: 'docs.nav.aiAssistant', order: 4 },
    ],
  },
  {
    id: 'admin',
    titleKey: 'docs.nav.adminGuide',
    icon: Settings,
    pages: [
      { slug: 'admin', titleKey: 'docs.nav.overview', order: 1 },
      { slug: 'admin/members-invitations', titleKey: 'docs.nav.membersInvitations', order: 2 },
      { slug: 'admin/roles-permissions', titleKey: 'docs.nav.rolesPermissions', order: 3 },
      { slug: 'admin/settings', titleKey: 'docs.nav.settings', order: 4 },
      { slug: 'admin/integrations', titleKey: 'docs.nav.integrations', order: 5 },
    ],
  },
  {
    id: 'faq',
    titleKey: 'docs.nav.faq',
    icon: HelpCircle,
    pages: [{ slug: 'faq', titleKey: 'docs.nav.faq', order: 1 }],
  },
];

/** Flat ordered list of all doc pages for prev/next navigation */
export function getAllDocPages(): DocNavItem[] {
  const pages: DocNavItem[] = [];
  for (const section of docSections) {
    for (const page of section.pages) {
      pages.push({ slug: page.slug, titleKey: page.titleKey, section: section.id });
    }
  }
  return pages;
}

/** Get prev and next pages for a given slug */
export function getPrevNextPages(slug: string): { prev: DocNavItem | null; next: DocNavItem | null } {
  const pages = getAllDocPages();
  const idx = pages.findIndex((p) => p.slug === slug);
  return {
    prev: idx > 0 ? pages[idx - 1] : null,
    next: idx < pages.length - 1 ? pages[idx + 1] : null,
  };
}

/** Find which section a slug belongs to */
export function findSectionForSlug(slug: string): DocSection | undefined {
  return docSections.find((s) => s.pages.some((p) => p.slug === slug));
}

/** Get breadcrumb items for a slug */
export function getBreadcrumbs(slug: string): { titleKey: string; slug?: string }[] {
  const section = findSectionForSlug(slug);
  if (!section) return [];

  const page = section.pages.find((p) => p.slug === slug);
  const crumbs: { titleKey: string; slug?: string }[] = [{ titleKey: 'docs.title', slug: undefined }];

  // Add section if the slug is a sub-page (has /)
  if (slug.includes('/')) {
    crumbs.push({ titleKey: section.titleKey, slug: section.pages[0]?.slug });
  }

  if (page) {
    crumbs.push({ titleKey: page.titleKey });
  }

  return crumbs;
}
