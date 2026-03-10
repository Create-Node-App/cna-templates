/**
 * Landing page data: feature blocks and pricing plans for demo.
 */

import type { LucideIcon } from 'lucide-react';

export interface FeatureItem {
  title: string;
  description: string;
  icon: LucideIcon;
}

export interface FeatureBlock {
  title: string;
  description: string;
  features: FeatureItem[];
}

export interface PricingPlan {
  name: string;
  price: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  cta: string;
}

// Feature block with icon keys (icons resolved in page component)
export interface FeatureBlockWithIconKeys {
  title: string;
  description: string;
  features: Array<{ title: string; description: string; iconKey: string }>;
}

export const LANDING_FEATURE_BLOCKS: FeatureBlockWithIconKeys[] = [
  {
    title: 'For your users',
    description: 'Everything your users need to get started and stay productive.',
    features: [
      {
        title: 'Profile',
        description: 'Complete user profiles with avatars and GitHub integration.',
        iconKey: 'user',
      },
      {
        title: 'AI Assistant',
        description: 'Natural language chat powered by OpenAI or Anthropic.',
        iconKey: 'message',
      },
      {
        title: 'Knowledge Base',
        description: "Search and browse your organization's docs and content.",
        iconKey: 'file-text',
      },
      {
        title: 'Directory',
        description: 'Find and connect with team members across your organization.',
        iconKey: 'users',
      },
    ],
  },
  {
    title: 'For your team',
    description: 'Collaboration and visibility tools for growing teams.',
    features: [
      {
        title: 'People Directory',
        description: 'Browse and search team members with filters.',
        iconKey: 'search',
      },
      {
        title: 'Org Chart',
        description: 'Visualize team structure and reporting relationships.',
        iconKey: 'git-branch',
      },
      {
        title: 'Activity Feed',
        description: 'Real-time updates on team and platform activity.',
        iconKey: 'trending',
      },
      {
        title: 'Webhooks',
        description: 'Push events to external systems as things happen.',
        iconKey: 'target',
      },
    ],
  },
  {
    title: 'For administrators',
    description: 'Full control for admins managing the platform.',
    features: [
      {
        title: 'Member Management',
        description: 'Invite, manage, and deactivate team members.',
        iconKey: 'users',
      },
      {
        title: 'Roles & Permissions',
        description: 'Fine-grained PBAC with custom role bundles.',
        iconKey: 'shield',
      },
      {
        title: 'Audit Logs',
        description: 'Complete trail of all actions across the platform.',
        iconKey: 'file-text',
      },
      {
        title: 'Settings',
        description: 'Tenant-level config, branding, and feature flags.',
        iconKey: 'target',
      },
    ],
  },
  {
    title: 'AI & Integrations',
    description: 'Connect AI and external systems to your platform.',
    features: [
      {
        title: 'AI Chat',
        description: 'Conversational search across all your data.',
        iconKey: 'message',
      },
      {
        title: 'Vector Search',
        description: 'Semantic search powered by pgvector embeddings.',
        iconKey: 'search',
      },
      {
        title: 'GitHub Integration',
        description: 'Sync user profiles and activity from GitHub.',
        iconKey: 'git-branch',
      },
      {
        title: 'Integration Engine',
        description: 'Connect any external system with the sync framework.',
        iconKey: 'layers',
      },
    ],
  },
];

export const LANDING_PRICING_PLANS: PricingPlan[] = [
  {
    name: 'Free',
    price: '$0',
    description: 'Up to 10 users. Get started with the essentials.',
    features: [
      'Up to 10 users',
      'AI assistant (limited)',
      'GitHub integration',
      'Knowledge base (read)',
      'Community support',
    ],
    cta: 'Get Started',
  },
  {
    name: 'Pro',
    price: 'Demo',
    description: 'For growing teams that need more power.',
    highlighted: true,
    features: [
      'Unlimited users',
      'Custom roles & permissions',
      'Webhooks & audit logs',
      'Full knowledge base',
      'Priority support',
    ],
    cta: 'Get Started',
  },
  {
    name: 'Enterprise',
    price: 'Demo',
    description: 'For organizations with advanced needs.',
    features: ['Everything in Pro', 'SSO (Auth0)', 'Custom integrations', 'SLA guarantee', 'Dedicated support'],
    cta: 'Contact us',
  },
];
