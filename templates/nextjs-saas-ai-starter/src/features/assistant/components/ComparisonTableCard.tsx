'use client';

/**
 * ComparisonTableCard Component
 *
 * Rich comparison table for displaying side-by-side comparisons in AI chat.
 */

import { CheckCircle, Scale, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { cn } from '@/shared/lib/utils';

import type { DetectedComparison } from '../utils/pattern-detectors';

interface ComparisonTableCardProps {
  comparison: DetectedComparison;
  className?: string;
  entityIds?: string[];
  tenantSlug?: string;
}

/**
 * Parse comparison value to extract level and status
 */
function parseComparisonValue(value: string): { level: number | null; hasEmoji: string | null; text: string } {
  // Check for emoji indicators
  const checkMatch = value.match(/(✅|✔|☑)/);
  const crossMatch = value.match(/(❌|✖|☒)/);

  // Extract number
  const numberMatch = value.match(/(\d+)/);
  const level = numberMatch ? parseInt(numberMatch[1], 10) : null;

  // Clean text
  const text = value.replace(/(✅|✔|☑|❌|✖|☒)/g, '').trim();

  return {
    level,
    hasEmoji: checkMatch ? 'check' : crossMatch ? 'cross' : null,
    text: text || (level !== null ? level.toString() : '-'),
  };
}

/**
 * Get color class based on comparison result
 */
function getComparisonColor(value1: string, value2: string): { col1: string; col2: string } {
  const parsed1 = parseComparisonValue(value1);
  const parsed2 = parseComparisonValue(value2);

  // If both have levels, compare them
  if (parsed1.level !== null && parsed2.level !== null) {
    if (parsed1.level > parsed2.level) {
      return { col1: 'text-green-600 font-semibold', col2: 'text-muted-foreground' };
    } else if (parsed2.level > parsed1.level) {
      return { col1: 'text-muted-foreground', col2: 'text-green-600 font-semibold' };
    }
  }

  // Check for emoji indicators
  if (parsed1.hasEmoji === 'check' && parsed2.hasEmoji !== 'check') {
    return { col1: 'text-green-600', col2: 'text-red-500' };
  } else if (parsed2.hasEmoji === 'check' && parsed1.hasEmoji !== 'check') {
    return { col1: 'text-red-500', col2: 'text-green-600' };
  }

  return { col1: '', col2: '' };
}

export function ComparisonTableCard({ comparison, className, entityIds, tenantSlug }: ComparisonTableCardProps) {
  const t = useTranslations('genui');
  const entityNames = comparison.headers.slice(1);

  // Generate initials for avatars
  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="pb-3 bg-muted">
        <CardTitle className="flex items-center gap-2 text-base">
          <Scale className="h-4 w-4 text-purple-600" />
          {t('comparison')}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto">
        {/* Header with entity avatars */}
        <div
          className="grid border-b bg-muted/30 min-w-[400px]"
          style={{ gridTemplateColumns: `minmax(120px, 1fr) repeat(${entityNames.length}, minmax(100px, 1fr))` }}
        >
          <div className="p-3 font-medium text-sm text-muted-foreground">{comparison.headers[0] || t('attribute')}</div>
          {entityNames.map((name, i) => {
            const entityId = entityIds?.[i];
            const href = tenantSlug && entityId ? `/t/${tenantSlug}/team/${entityId}` : undefined;
            const cell = (
              <div key={i} className="p-3 flex items-center gap-2 justify-center">
                <Avatar className="h-6 w-6">
                  <AvatarFallback
                    className={cn('text-xs', i === 0 ? 'bg-purple-500 text-white' : 'bg-blue-500 text-white')}
                  >
                    {getInitials(name)}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium text-sm truncate">{name}</span>
              </div>
            );
            return href ? (
              <Link key={i} href={href} className="hover:bg-muted/50 transition-colors" aria-label={name}>
                {cell}
              </Link>
            ) : (
              <div key={i}>{cell}</div>
            );
          })}
        </div>

        {/* Comparison rows */}
        <div className="divide-y min-w-[400px]">
          {comparison.rows.map((row, rowIndex) => {
            const colors =
              row.values.length >= 2 ? getComparisonColor(row.values[0], row.values[1]) : { col1: '', col2: '' };

            return (
              <div
                key={rowIndex}
                className="grid hover:bg-muted/20 transition-colors"
                style={{ gridTemplateColumns: `minmax(120px, 1fr) repeat(${entityNames.length}, minmax(100px, 1fr))` }}
              >
                <div className="p-3 text-sm font-medium">{row.label}</div>
                {row.values.map((value, colIndex) => {
                  const parsed = parseComparisonValue(value);
                  const colorClass = colIndex === 0 ? colors.col1 : colors.col2;

                  return (
                    <div key={colIndex} className="p-3 flex items-center justify-center gap-1">
                      {parsed.hasEmoji === 'check' && <CheckCircle className="h-4 w-4 text-green-500" />}
                      {parsed.hasEmoji === 'cross' && <XCircle className="h-4 w-4 text-red-500" />}
                      <span className={cn('text-sm', colorClass)}>{parsed.text}</span>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
