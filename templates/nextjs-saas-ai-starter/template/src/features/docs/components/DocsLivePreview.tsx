'use client';

import { Eye } from 'lucide-react';

import { DOCS_COMPONENT_REGISTRY, parsePreviewBlock } from '../lib/docs-component-registry';

interface DocsLivePreviewProps {
  raw: string;
}

export function DocsLivePreview({ raw }: DocsLivePreviewProps) {
  const parsed = parsePreviewBlock(raw);

  if (!parsed) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4 text-sm text-destructive">
        Invalid preview block. Expected format: <code>component: Name</code>
      </div>
    );
  }

  const factory = DOCS_COMPONENT_REGISTRY[parsed.component];

  if (!factory) {
    return (
      <div className="rounded-lg border border-warning/50 bg-warning/5 p-4 text-sm text-muted-foreground">
        Component <code className="font-mono text-foreground">{parsed.component}</code> is not registered for preview.
      </div>
    );
  }

  return (
    <div className="not-prose my-6 rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 border-b border-border px-4 py-2 bg-muted/30">
        <Eye className="h-3.5 w-3.5 text-primary" />
        <span className="text-xs font-medium text-muted-foreground">Live Preview</span>
        <span className="text-xs text-muted-foreground/60">— {parsed.component}</span>
      </div>
      <div className="p-6 flex items-center justify-center">{factory(parsed.props)}</div>
    </div>
  );
}
