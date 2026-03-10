'use client';

/**
 * Docs Component Registry
 *
 * Maps component names used in markdown `preview` code blocks to actual React components.
 * Each entry includes default props for rendering a safe preview.
 */

import { Search, Sparkles } from 'lucide-react';
import type { ReactNode } from 'react';

import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { EmptyState } from '@/shared/components/ui/empty-state';
import { StatCard } from '@/shared/components/ui/stat-card';

// Registry entry: component factory that takes parsed props and returns JSX
type ComponentFactory = (props: Record<string, unknown>) => ReactNode;

export const DOCS_COMPONENT_REGISTRY: Record<string, ComponentFactory> = {
  Badge: (props) => (
    <Badge variant={(props.variant as 'default' | 'secondary' | 'outline' | 'destructive') ?? 'default'}>
      {(props.children as string) ?? 'Sample Badge'}
    </Badge>
  ),

  Button: (props) => (
    <Button
      variant={(props.variant as 'default' | 'secondary' | 'outline' | 'destructive' | 'ghost') ?? 'default'}
      size={(props.size as 'default' | 'sm' | 'lg') ?? 'default'}
    >
      {(props.children as string) ?? 'Click me'}
    </Button>
  ),

  ButtonVariants: () => (
    <div className="flex flex-wrap gap-2">
      <Button variant="default">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="success">Success</Button>
    </div>
  ),

  Card: (props) => (
    <Card>
      <CardHeader>
        <CardTitle>{(props.title as string) ?? 'Card Title'}</CardTitle>
        <CardDescription>{(props.description as string) ?? 'A sample card description.'}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{(props.content as string) ?? 'Card content goes here.'}</p>
      </CardContent>
    </Card>
  ),

  StatCard: (props) => (
    <StatCard
      icon={Sparkles}
      value={(props.value as string | number) ?? 42}
      label={(props.label as string) ?? 'Skills assessed'}
      variant={(props.variant as 'default') ?? 'default'}
    />
  ),

  EmptyState: (props) => (
    <EmptyState
      icon={Search}
      title={(props.title as string) ?? 'No results found'}
      description={(props.description as string) ?? 'Try adjusting your search or filters.'}
      domain={(props.domain as 'default') ?? 'default'}
    />
  ),
};

/**
 * Parse a preview code block's raw text into component name and props.
 *
 * Expected format:
 * ```preview
 * component: ComponentName
 * props: { "key": "value" }
 * ```
 */
export function parsePreviewBlock(raw: string): { component: string; props: Record<string, unknown> } | null {
  const lines = raw.trim().split('\n');
  let component = '';
  let props: Record<string, unknown> = {};

  for (const line of lines) {
    const compMatch = line.match(/^component:\s*(.+)/);
    if (compMatch) {
      component = compMatch[1].trim();
    }
    const propsMatch = line.match(/^props:\s*(.+)/);
    if (propsMatch) {
      try {
        props = JSON.parse(propsMatch[1].trim());
      } catch {
        // Invalid JSON — use empty props
      }
    }
  }

  if (!component) return null;
  return { component, props };
}
