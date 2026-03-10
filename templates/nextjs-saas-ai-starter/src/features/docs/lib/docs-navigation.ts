import { BookOpen, Briefcase, GraduationCap, HelpCircle, Settings, Users } from 'lucide-react';

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
      { slug: 'member/skills-assessment', titleKey: 'docs.nav.skillsAssessment', order: 4 },
      { slug: 'member/interests-growth', titleKey: 'docs.nav.interestsGrowth', order: 5 },
      { slug: 'member/learning', titleKey: 'docs.nav.learning', order: 6 },
      { slug: 'member/okrs', titleKey: 'docs.nav.okrs', order: 7 },
      { slug: 'member/performance', titleKey: 'docs.nav.performance', order: 8 },
      { slug: 'member/projects', titleKey: 'docs.nav.projects', order: 9 },
      { slug: 'member/people-finder', titleKey: 'docs.nav.peopleFinder', order: 10 },
      { slug: 'member/knowledge-base', titleKey: 'docs.nav.knowledgeBase', order: 11 },
      { slug: 'member/directory-org-chart', titleKey: 'docs.nav.directoryOrgChart', order: 12 },
      { slug: 'member/feedback-recognition', titleKey: 'docs.nav.feedbackRecognition', order: 13 },
      { slug: 'member/ai-assistant', titleKey: 'docs.nav.aiAssistant', order: 14 },
    ],
  },
  {
    id: 'manager',
    titleKey: 'docs.nav.managerGuide',
    icon: Briefcase,
    pages: [
      { slug: 'manager', titleKey: 'docs.nav.overview', order: 1 },
      { slug: 'manager/dashboard', titleKey: 'docs.nav.dashboard', order: 2 },
      { slug: 'manager/team-management', titleKey: 'docs.nav.teamManagement', order: 3 },
      { slug: 'manager/projects-clients', titleKey: 'docs.nav.projectsClients', order: 4 },
      { slug: 'manager/performance-assessments', titleKey: 'docs.nav.performanceAssessments', order: 5 },
      { slug: 'manager/learning-assignments', titleKey: 'docs.nav.learningAssignments', order: 6 },
      { slug: 'manager/team-okrs', titleKey: 'docs.nav.teamOkrs', order: 7 },
      { slug: 'manager/one-on-one-meetings', titleKey: 'docs.nav.oneOnOneMeetings', order: 8 },
      { slug: 'manager/analytics', titleKey: 'docs.nav.analytics', order: 9 },
      { slug: 'manager/track-overview', titleKey: 'docs.nav.trackOverview', order: 10 },
    ],
  },
  {
    id: 'one-on-one',
    titleKey: 'docs.nav.oneOnOneGuide',
    icon: Users,
    pages: [
      { slug: 'one-on-one', titleKey: 'docs.nav.overview', order: 1 },
      { slug: 'one-on-one/dashboard', titleKey: 'docs.nav.dashboard', order: 2 },
      { slug: 'one-on-one/meetings', titleKey: 'docs.nav.meetings', order: 3 },
      { slug: 'one-on-one/performance-projects', titleKey: 'docs.nav.performanceProjects', order: 4 },
    ],
  },
  {
    id: 'admin',
    titleKey: 'docs.nav.adminGuide',
    icon: Settings,
    pages: [
      { slug: 'admin', titleKey: 'docs.nav.overview', order: 1 },
      { slug: 'admin/members-invitations', titleKey: 'docs.nav.membersInvitations', order: 2 },
      { slug: 'admin/skills-management', titleKey: 'docs.nav.skillsManagement', order: 3 },
      { slug: 'admin/capabilities', titleKey: 'docs.nav.capabilities', order: 4 },
      { slug: 'admin/role-profiles', titleKey: 'docs.nav.roleProfiles', order: 5 },
      { slug: 'admin/trainings-roadmaps', titleKey: 'docs.nav.trainingsRoadmaps', order: 6 },
      { slug: 'admin/roles-permissions', titleKey: 'docs.nav.rolesPermissions', order: 7 },
      { slug: 'admin/settings', titleKey: 'docs.nav.settings', order: 8 },
      { slug: 'admin/integrations', titleKey: 'docs.nav.integrations', order: 9 },
      { slug: 'admin/analytics-audit', titleKey: 'docs.nav.analyticsAudit', order: 10 },
      { slug: 'admin/onboarding-import', titleKey: 'docs.nav.onboardingImport', order: 11 },
      { slug: 'admin/recognitions', titleKey: 'docs.nav.recognitions', order: 12 },
      { slug: 'admin/review-cycles', titleKey: 'docs.nav.reviewCycles', order: 13 },
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
