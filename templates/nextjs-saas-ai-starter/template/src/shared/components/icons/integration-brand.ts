/**
 * Brand color registry for all integrations.
 * Maps each integration slug to its brand identity (icon, colors, Tailwind classes).
 */

import type { ComponentType } from 'react';

import {
  GitHubIcon,
  GitLabIcon,
  GoogleWorkspaceIcon,
  LinkedInIcon,
  SlackIcon,
  WebhookBrandIcon,
} from './integration-icons';
export interface IntegrationBrand {
  icon: ComponentType<{ className?: string }>;
  color: string;
  bgLight: string;
  bgDark: string;
  borderLight: string;
  borderDark: string;
  textColor: string;
  /** Gradient for detail page header (from -> to) */
  gradientFrom: string;
  gradientTo: string;
}

export const integrationBrands: Record<string, IntegrationBrand> = {
  webhooks: {
    icon: WebhookBrandIcon,
    color: '#6366F1',
    bgLight: 'bg-indigo-50',
    bgDark: 'dark:bg-indigo-950/20',
    borderLight: 'border-indigo-200',
    borderDark: 'dark:border-indigo-800',
    textColor: 'text-indigo-600',
    gradientFrom: 'from-indigo-50',
    gradientTo: 'to-indigo-100/50',
  },
  'google-workspace': {
    icon: GoogleWorkspaceIcon,
    color: '#4285F4',
    bgLight: 'bg-sky-50',
    bgDark: 'dark:bg-sky-950/20',
    borderLight: 'border-sky-200',
    borderDark: 'dark:border-sky-800',
    textColor: 'text-sky-600',
    gradientFrom: 'from-sky-50',
    gradientTo: 'to-sky-100/50',
  },
  slack: {
    icon: SlackIcon,
    color: '#4A154B',
    bgLight: 'bg-purple-50',
    bgDark: 'dark:bg-purple-950/20',
    borderLight: 'border-purple-200',
    borderDark: 'dark:border-purple-800',
    textColor: 'text-purple-600',
    gradientFrom: 'from-purple-50',
    gradientTo: 'to-purple-100/50',
  },
  github: {
    icon: GitHubIcon,
    color: '#24292E',
    bgLight: 'bg-gray-50',
    bgDark: 'dark:bg-gray-950/20',
    borderLight: 'border-gray-300',
    borderDark: 'dark:border-gray-700',
    textColor: 'text-gray-700',
    gradientFrom: 'from-gray-50',
    gradientTo: 'to-gray-100/50',
  },
  gitlab: {
    icon: GitLabIcon,
    color: '#FC6D26',
    bgLight: 'bg-orange-50',
    bgDark: 'dark:bg-orange-950/20',
    borderLight: 'border-orange-200',
    borderDark: 'dark:border-orange-800',
    textColor: 'text-orange-600',
    gradientFrom: 'from-orange-50',
    gradientTo: 'to-orange-100/50',
  },
  linkedin: {
    icon: LinkedInIcon,
    color: '#0A66C2',
    bgLight: 'bg-blue-50',
    bgDark: 'dark:bg-blue-950/20',
    borderLight: 'border-blue-200',
    borderDark: 'dark:border-blue-800',
    textColor: 'text-blue-700',
    gradientFrom: 'from-blue-50',
    gradientTo: 'to-blue-100/50',
  },
} as const;

/**
 * Get brand info for an integration by slug, with fallback.
 */
export function getIntegrationBrand(slug: string): IntegrationBrand | undefined {
  return integrationBrands[slug];
}
