'use client';

/**
 * KnowledgeDocCard – compact list of knowledge documents for GenUI.
 * Differentiates trainings, roadmaps, and role profiles with distinct icons and labels.
 */

import { BookOpen, ExternalLink, FileText, GraduationCap, Route } from 'lucide-react';
import Link from 'next/link';

import { Badge } from '@/shared/components/ui/badge';
import { cn } from '@/shared/lib/utils';

import type { KnowledgeDocItem } from '../types/genui';

/** Readable labels and icons per docType */
const DOC_TYPE_CONFIG: Record<
  string,
  { label: string; icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  training: {
    label: 'Training',
    icon: GraduationCap,
    color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/15',
  },
  roadmap: {
    label: 'Roadmap',
    icon: Route,
    color: 'text-blue-600 dark:text-blue-400 bg-blue-500/15',
  },
  role_profile: {
    label: 'Role Profile',
    icon: BookOpen,
    color: 'text-purple-600 dark:text-purple-400 bg-purple-500/15',
  },
};

const DEFAULT_CONFIG = {
  label: 'Document',
  icon: FileText,
  color: 'text-muted-foreground bg-muted',
};

function getDocConfig(docType: string) {
  return DOC_TYPE_CONFIG[docType] || DEFAULT_CONFIG;
}

/* -------------------------------------------------------------------------- */
/*  Exported individual row (used by ToolPartRenderer inside CollapsibleList) */
/* -------------------------------------------------------------------------- */

interface KnowledgeDocRowProps {
  doc: KnowledgeDocItem;
  tenantSlug?: string;
}

export function KnowledgeDocRow({ doc, tenantSlug }: KnowledgeDocRowProps) {
  const href = tenantSlug ? `/t/${tenantSlug}/knowledge/${doc.slug}` : undefined;
  const config = getDocConfig(doc.docType);
  const Icon = config.icon;

  const row = (
    <div
      className={cn(
        'flex items-center gap-2.5 px-3 py-2 transition-colors group',
        href && 'hover:bg-muted/60 cursor-pointer',
      )}
    >
      {/* Type icon */}
      <div className={cn('p-1 rounded shrink-0', config.color)}>
        <Icon className="h-3.5 w-3.5" aria-hidden />
      </div>

      {/* Title */}
      <span className="font-medium text-sm truncate flex-1 min-w-0 group-hover:text-primary transition-colors">
        {doc.title}
      </span>

      {/* Type badge */}
      <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 shrink-0 border-0 bg-muted">
        {config.label}
      </Badge>

      {/* Link indicator */}
      {href && (
        <ExternalLink className="h-3 w-3 text-muted-foreground/50 shrink-0 group-hover:text-primary transition-colors" />
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} aria-label={`Ver: ${doc.title}`}>
        {row}
      </Link>
    );
  }
  return row;
}

/* -------------------------------------------------------------------------- */
/*  Full card (standalone usage)                                              */
/* -------------------------------------------------------------------------- */

interface KnowledgeDocCardProps {
  documents: KnowledgeDocItem[];
  tenantSlug?: string;
  className?: string;
}

export function KnowledgeDocCard({ documents, tenantSlug, className }: KnowledgeDocCardProps) {
  if (documents.length === 0) return null;

  return (
    <div className={cn('rounded-lg border bg-muted/20 overflow-hidden', className)}>
      <div className="divide-y divide-border/50">
        {documents.map((doc) => (
          <KnowledgeDocRow key={doc.id} doc={doc} tenantSlug={tenantSlug} />
        ))}
      </div>
    </div>
  );
}
