'use client';

/**
 * Renders a single tool-invocation message part (GenUI).
 * Used when part.type starts with 'tool-' and part.state is output-available.
 */

import { ChevronDown, ChevronUp, FileText, Loader2, Search, Target, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Badge } from '@/shared/components/ui/badge';
import { cn } from '@/shared/lib/utils';

import { ComparisonTableCard } from './ComparisonTableCard';
import { KnowledgeDocRow } from './KnowledgeDocCard';
import { PersonMiniCard } from './PersonMiniCard';
import type {
  CompareCandidatesOutput,
  FindCandidatesOutput,
  GetPersonOutput,
  SearchKnowledgeOutput,
  SearchPeopleOutput,
} from '../types/genui';
import {
  compareCandidatesOutputSchema,
  findCandidatesOutputSchema,
  getPersonOutputSchema,
  searchKnowledgeOutputSchema,
  searchPeopleOutputSchema,
} from '../types/genui';

/** Max items shown before "show more" toggle */
const MAX_VISIBLE_ITEMS = 3;

interface ToolPartRendererProps {
  partType: string;
  partState: string;
  partOutput: unknown;
  partErrorText?: string;
  tenantSlug?: string;
  className?: string;
}

/**
 * Collapsible list wrapper: shows header context + first N items with a toggle button for the rest.
 */
function CollapsibleList({
  children,
  total,
  header,
  className,
}: {
  children: React.ReactNode[];
  total: number;
  header?: React.ReactNode;
  className?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const t = useTranslations('genui');

  const visibleChildren = expanded ? children : children.slice(0, MAX_VISIBLE_ITEMS);
  const hiddenCount = total - MAX_VISIBLE_ITEMS;

  return (
    <div className={cn('rounded-lg border bg-muted/20 overflow-hidden', className)}>
      {header && <div className="border-b">{header}</div>}
      <div className="divide-y divide-border/50">{visibleChildren}</div>
      {hiddenCount > 0 && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="w-full flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40 py-2 transition-colors border-t"
        >
          {expanded ? (
            <>
              <ChevronUp className="h-3 w-3" />
              {t('showLess')}
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3" />
              {t('showMore', { count: hiddenCount })}
            </>
          )}
        </button>
      )}
    </div>
  );
}

/**
 * Header for search results showing a summary label.
 */
function ResultHeader({
  icon,
  label,
  count,
  detail,
}: {
  icon: React.ReactNode;
  label: string;
  count?: number;
  detail?: string;
}) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-muted/30">
      <span className="text-muted-foreground">{icon}</span>
      <span className="text-xs font-medium text-muted-foreground truncate">{label}</span>
      {count != null && (
        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 ml-auto shrink-0">
          {count}
        </Badge>
      )}
      {detail && <span className="text-[10px] text-muted-foreground ml-auto shrink-0">{detail}</span>}
    </div>
  );
}

export function ToolPartRenderer({
  partType,
  partState,
  partOutput,
  partErrorText,
  tenantSlug,
  className,
}: ToolPartRendererProps) {
  const t = useTranslations('assistant');

  if (partState === 'input-available' || partState === 'input-streaming') {
    return (
      <div className={cn('flex items-center gap-2 text-sm text-muted-foreground py-2', className)}>
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        <span>{t('thinking')}</span>
      </div>
    );
  }

  if (partState === 'output-error') {
    return (
      <div className={cn('text-sm text-destructive py-2', className)} role="alert">
        {partErrorText ?? t('error')}
      </div>
    );
  }

  if (partState !== 'output-available' || partOutput == null) {
    return null;
  }

  switch (partType) {
    case 'tool-searchPeople': {
      const parsed = searchPeopleOutputSchema.safeParse(partOutput);
      if (!parsed.success) return null;
      const data = parsed.data as SearchPeopleOutput;
      if (data.items.length === 0) return null;

      const cards = data.items.map((item, index) => (
        <PersonMiniCard
          key={item.personId}
          person={{
            name: item.name,
            department: item.department,
            skills: item.skills,
            raw: '',
          }}
          rank={index + 1}
          personId={item.personId}
          tenantSlug={tenantSlug}
        />
      ));

      // Extract a short label from the summary (e.g. 'Personas con skills de "React"')
      const summaryLabel = data.summary.replace(/[#*]/g, '').trim();

      return (
        <CollapsibleList
          total={data.items.length}
          header={
            <ResultHeader icon={<Search className="h-3.5 w-3.5" />} label={summaryLabel} count={data.items.length} />
          }
          className={cn('mt-2', className)}
        >
          {cards}
        </CollapsibleList>
      );
    }

    case 'tool-findCandidates': {
      const parsed = findCandidatesOutputSchema.safeParse(partOutput);
      if (!parsed.success) return null;
      const data = parsed.data as FindCandidatesOutput;
      if (data.candidates.length === 0) return null;

      const cards = data.candidates.map((c, index) => (
        <PersonMiniCard
          key={c.personId}
          person={{
            name: c.name,
            department: c.department,
            skills: undefined,
            raw: '',
          }}
          rank={index + 1}
          personId={c.personId}
          tenantSlug={tenantSlug}
          score={c.score}
          met={c.met}
          gaps={c.gaps}
        />
      ));

      const label = data.capabilityName
        ? `Candidatos para "${data.capabilityName}"`
        : data.summary.split('\n')[0].replace(/[#*]/g, '').trim();

      return (
        <CollapsibleList
          total={data.candidates.length}
          header={
            <ResultHeader icon={<Target className="h-3.5 w-3.5" />} label={label} count={data.candidates.length} />
          }
          className={cn('mt-2', className)}
        >
          {cards}
        </CollapsibleList>
      );
    }

    case 'tool-getPerson': {
      const parsed = getPersonOutputSchema.safeParse(partOutput);
      if (!parsed.success) return null;
      const data = parsed.data as GetPersonOutput;
      if (!data.item) return null;
      return (
        <div className={cn('rounded-lg border bg-muted/20 overflow-hidden mt-2', className)}>
          <ResultHeader icon={<Users className="h-3.5 w-3.5" />} label={data.summary.replace(/[#*]/g, '').trim()} />
          <PersonMiniCard
            person={{
              name: data.item.name,
              department: data.item.department,
              skills: data.item.skills,
              raw: '',
            }}
            personId={data.item.personId}
            tenantSlug={tenantSlug}
          />
        </div>
      );
    }

    case 'tool-getCapability':
    case 'tool-listCapabilities':
      // Capability tools removed - return null
      return null;

    case 'tool-searchKnowledge': {
      const parsed = searchKnowledgeOutputSchema.safeParse(partOutput);
      if (!parsed.success) return null;
      const data = parsed.data as SearchKnowledgeOutput;
      if (data.documents.length === 0) return null;

      const headerLabel = data.summary
        ? data.summary
            .split('\n')[0]
            .replace(/[#*]/g, '')
            .replace(/\(búsqueda.*\)/, '')
            .trim()
        : 'Knowledge documents';

      const rows = data.documents.map((doc) => <KnowledgeDocRow key={doc.id} doc={doc} tenantSlug={tenantSlug} />);

      return (
        <CollapsibleList
          total={data.documents.length}
          header={
            <ResultHeader
              icon={<FileText className="h-3.5 w-3.5" />}
              label={headerLabel}
              count={data.documents.length}
            />
          }
          className={cn('mt-2', className)}
        >
          {rows}
        </CollapsibleList>
      );
    }

    case 'tool-compareCandidates':
    case 'tool-findAndCompareTop': {
      const parsed = compareCandidatesOutputSchema.safeParse(partOutput);
      if (!parsed.success) return null;
      const data = parsed.data as CompareCandidatesOutput;
      if (data.rows.length === 0) return null;
      return (
        <ComparisonTableCard
          comparison={{ headers: data.headers, rows: data.rows, raw: '' }}
          personIds={data.personIds}
          tenantSlug={tenantSlug}
          className={cn('mt-2', className)}
        />
      );
    }

    default:
      return null;
  }
}
