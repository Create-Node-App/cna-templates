export interface Feature {
  icon: string;
  title: string;
  description: string;
}

export interface DocsLink {
  label: string;
  href: string;
}

export interface TemplateLandingData {
  eyebrow: string;
  lead: string;
  features: Feature[];
  docs: DocsLink[];
}

export const reactVite: TemplateLandingData = {
  eyebrow: 'Your project is ready',
  lead: 'A cozy React + Vite starter with a feature-based foundation. Everything you need to start building your next screen.',
  features: [
    { icon: '⚡', title: 'Vite', description: 'Instant HMR and a fast, opinionated build pipeline.' },
    { icon: '⚛️', title: 'React', description: 'Latest React with modern patterns and future-ready APIs.' },
    { icon: '🧭', title: 'React Router v7', description: 'Client-side routing already wired for nested routes.' },
    { icon: '🛡️', title: 'TypeScript + ESLint + Prettier', description: 'Static typing and consistent, automated code style.' },
    { icon: '📦', title: 'Feature-based structure', description: 'Scale by co-locating routes, state, and components.' },
    { icon: '🧩', title: 'Addon ready', description: 'Layer UI libraries, state tools, testing, and deployment.' },
  ],
  docs: [
    { label: 'Project overview', href: '/docs/README.md' },
    { label: 'Project structure', href: '/docs/PROJECT_STRUCTURE.md' },
    { label: 'Components & styling', href: '/docs/COMPONENTS_AND_STYLING.md' },
    { label: 'State management', href: '/docs/STATE_MANAGEMENT.md' },
  ],
};

export const nextjs: TemplateLandingData = {
  eyebrow: 'Your project is ready',
  lead: 'A cozy Next.js starter with a feature-based foundation. Everything you need to start building your next page.',
  features: [
    { icon: '▲', title: 'Next.js App Router', description: 'File-system routing, layouts, and latest React features out of the box.' },
    { icon: '⚛️', title: 'React', description: 'Latest React with modern patterns and future-ready APIs.' },
    { icon: '🛡️', title: 'TypeScript + ESLint + Prettier', description: 'Static typing and consistent, automated code style.' },
    { icon: '📦', title: 'Feature-based structure', description: 'Scale by co-locating routes, state, and components.' },
    { icon: '🔐', title: 'Login example', description: 'A ready-made auth route to kickstart protected flows.' },
    { icon: '🧩', title: 'Addon ready', description: 'Layer UI libraries, state tools, testing, and deployment.' },
  ],
  docs: [
    { label: 'Project overview', href: '/docs/README.md' },
    { label: 'Project structure', href: '/docs/PROJECT_STRUCTURE.md' },
    { label: 'Components & styling', href: '/docs/COMPONENTS_AND_STYLING.md' },
    { label: 'State management', href: '/docs/STATE_MANAGEMENT.md' },
  ],
};

export const remix: TemplateLandingData = {
  eyebrow: 'Your project is ready',
  lead: 'A cozy React Router starter with feature-based folders. Everything you need to start building your next route.',
  features: [
    { icon: '🧭', title: 'React Router v7', description: 'Modern data APIs and fast client-side navigation.' },
    { icon: '⚛️', title: 'React', description: 'Latest React with modern patterns and future-ready APIs.' },
    { icon: '🛡️', title: 'TypeScript', description: 'Static typing across routes and components.' },
    { icon: '⚡', title: 'Vite', description: 'Fast builds and instant HMR for rapid development.' },
    { icon: '📦', title: 'Feature-based structure', description: 'Scale by co-locating routes, state, and components.' },
    { icon: '🧩', title: 'Addon ready', description: 'Layer UI libraries, state tools, testing, and deployment.' },
  ],
  docs: [
    { label: 'Project overview', href: '/docs/README.md' },
    { label: 'Project structure', href: '/docs/PROJECT_STRUCTURE.md' },
    { label: 'Components & styling', href: '/docs/COMPONENTS_AND_STYLING.md' },
    { label: 'State management', href: '/docs/STATE_MANAGEMENT.md' },
  ],
};

export const astro: TemplateLandingData = {
  eyebrow: 'Your project is ready',
  lead: 'A cozy Astro starter with static-first performance and a feature-based foundation.',
  features: [
    { icon: '🚀', title: 'Astro', description: 'Fast static sites with partial hydration and content islands.' },
    { icon: '⚛️', title: 'React-ready', description: 'Add interactive islands with React, Preact, or Solid when needed.' },
    { icon: '🛡️', title: 'TypeScript', description: 'Type-safe components and pages out of the box.' },
    { icon: '📦', title: 'Feature-based structure', description: 'Organize components and pages as the project grows.' },
    { icon: '✨', title: 'Static output', description: 'Ship pre-rendered HTML with zero runtime by default.' },
    { icon: '🧩', title: 'Addon ready', description: 'Layer UI libraries, state tools, testing, and deployment.' },
  ],
  docs: [
    { label: 'Project overview', href: '/docs/README.md' },
    { label: 'Project structure', href: '/docs/PROJECT_STRUCTURE.md' },
    { label: 'Components & styling', href: '/docs/COMPONENTS_AND_STYLING.md' },
    { label: 'State management', href: '/docs/STATE_MANAGEMENT.md' },
  ],
};

export const webext: TemplateLandingData = {
  eyebrow: 'Your extension is ready',
  lead: 'A cozy browser-extension starter built with React and Vite. Customize the popup, options page, background scripts, and content scripts as your product evolves.',
  features: [
    { icon: '🔌', title: 'Browser extension shell', description: 'Popup, options, background, and content scripts already wired.' },
    { icon: '⚛️', title: 'React + Vite', description: 'Fast HMR and a modern component model for every extension page.' },
    { icon: '🛡️', title: 'TypeScript', description: 'Typed APIs and extension messaging from day one.' },
    { icon: '📦', title: 'Feature-based structure', description: 'Keep content, background, and UI organized as you grow.' },
    { icon: '🎨', title: 'CNA identity', description: 'Cozy amber + teal palette with dark/light support.' },
    { icon: '🧩', title: 'Addon ready', description: 'Layer state tools, storage wrappers, and deployment configs.' },
  ],
  docs: [
    { label: 'Project overview', href: '/docs/README.md' },
    { label: 'Project structure', href: '/docs/PROJECT_STRUCTURE.md' },
    { label: 'Components & styling', href: '/docs/COMPONENTS_AND_STYLING.md' },
    { label: 'State management', href: '/docs/STATE_MANAGEMENT.md' },
  ],
};
