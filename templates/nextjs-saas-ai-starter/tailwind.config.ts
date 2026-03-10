import type { Config } from 'tailwindcss';

/**
 * Next.js SaaS AI Template Tailwind Configuration (minimal)
 *
 * Theme and design tokens live in src/app/globals.css (@theme block).
 * Tailwind v4 is CSS-first; this file is kept for tooling that expects it
 * (e.g. shadcn CLI). Content paths are optional — v4 auto-detects.
 *
 * See docs/DESIGN_SYSTEM.md and docs/COMPONENTS_AND_STYLING.md.
 */
const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/shared/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
};

export default config;
