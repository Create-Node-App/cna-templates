'use client';

import {
  FileText,
  GitBranch,
  Layers,
  MessageSquare,
  Search,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
  User,
  Users,
} from 'lucide-react';
import { useState } from 'react';

import { Card, CardContent } from '@/shared/components/ui';
import { Badge } from '@/shared/components/ui/badge';
import { cn } from '@/shared/lib/utils';

const FEATURE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  user: User,
  target: Target,
  sparkles: Sparkles,
  trending: TrendingUp,
  message: MessageSquare,
  users: Users,
  search: Search,
  'git-branch': GitBranch,
  'message-square': MessageSquare,
  layers: Layers,
  'file-text': FileText,
  shield: Shield,
};

interface TabData {
  id: string;
  label: string;
  color: string;
  activeColor: string;
  description: string;
  features: Array<{ title: string; description: string; iconKey: string }>;
}

const TABS: TabData[] = [
  {
    id: 'users',
    label: 'For Users',
    color: 'hsl(155 70% 45%)',
    activeColor: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/30',
    description: 'Everything your users need to get started and stay productive.',
    features: [
      { title: 'Profile', description: 'Complete user profiles with avatars and GitHub integration.', iconKey: 'user' },
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
      { title: 'Directory', description: 'Find and connect with team members.', iconKey: 'users' },
    ],
  },
  {
    id: 'team',
    label: 'For Teams',
    color: 'hsl(231 88% 66%)',
    activeColor: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30',
    description: 'Collaboration and visibility tools for growing teams.',
    features: [
      { title: 'People Directory', description: 'Browse and search team members with filters.', iconKey: 'search' },
      {
        title: 'Org Chart',
        description: 'Visualize team structure and reporting relationships.',
        iconKey: 'git-branch',
      },
      { title: 'Activity Feed', description: 'Real-time updates on team and platform activity.', iconKey: 'trending' },
      { title: 'Webhooks', description: 'Push events to external systems as things happen.', iconKey: 'target' },
    ],
  },
  {
    id: 'admin',
    label: 'Administration',
    color: 'hsl(270 74% 58%)',
    activeColor: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/30',
    description: 'Full control for admins managing the platform.',
    features: [
      { title: 'Member Management', description: 'Invite, manage, and deactivate team members.', iconKey: 'users' },
      { title: 'Roles & Permissions', description: 'Fine-grained PBAC with custom role bundles.', iconKey: 'shield' },
      { title: 'Audit Logs', description: 'Complete trail of all actions across the platform.', iconKey: 'file-text' },
      { title: 'Settings', description: 'Tenant-level config, branding, and feature flags.', iconKey: 'target' },
    ],
  },
  {
    id: 'ai',
    label: 'AI & Integrations',
    color: 'hsl(32 95% 52%)',
    activeColor: 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/30',
    description: 'Connect AI and external systems to your platform.',
    features: [
      { title: 'AI Chat', description: 'Conversational search across all your data.', iconKey: 'message' },
      { title: 'Vector Search', description: 'Semantic search powered by pgvector embeddings.', iconKey: 'search' },
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

export function FeatureTabShowcase() {
  const [activeTab, setActiveTab] = useState('growth');
  const tab = TABS.find((t) => t.id === activeTab) ?? TABS[0];

  return (
    <div>
      {/* Tab Bar */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={cn(
              'rounded-full px-5 py-2 text-sm font-medium border transition-all duration-200',
              activeTab === t.id
                ? t.activeColor
                : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div key={tab.id} className="grid md:grid-cols-2 gap-8 items-start entrance-fade">
        {/* Left: Description + Feature List */}
        <div>
          <p className="text-lg text-muted-foreground mb-6">{tab.description}</p>
          <div className="space-y-3">
            {tab.features.map((feature) => {
              const Icon = FEATURE_ICONS[feature.iconKey] ?? Sparkles;
              return (
                <div key={feature.title} className="flex items-start gap-3 group">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                    <Icon className="h-4.5 w-4.5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{feature.title}</p>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Visual Preview Card */}
        <Card className="shadow-xl border-primary/10 overflow-hidden">
          <div className="h-2 w-full" style={{ background: tab.color }} />
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Badge className={cn('text-xs', tab.activeColor)}>{tab.label}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {tab.features.slice(0, 4).map((feature) => {
                const Icon = FEATURE_ICONS[feature.iconKey] ?? Sparkles;
                return (
                  <div key={feature.title} className="rounded-lg bg-muted/50 p-3 text-center">
                    <Icon className="h-5 w-5 mx-auto mb-1.5 text-muted-foreground" />
                    <p className="text-xs font-medium text-foreground">{feature.title}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
