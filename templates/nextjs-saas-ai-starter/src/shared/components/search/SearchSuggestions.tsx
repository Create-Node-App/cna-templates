'use client';

/**
 * Search Suggestions Component
 *
 * Displays instant search results in a dropdown while the user types.
 * Shows top results with similarity scores.
 */

import { FileText } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';

import { Badge } from '@/shared/components/ui/badge';
import { Progress } from '@/shared/components/ui/progress';
import { cn } from '@/shared/lib/utils';

interface SearchResult {
  id: string;
  type: string;
  title: string;
  subtitle?: string;
  similarity?: number;
  url: string;
}

interface SearchSuggestionsProps {
  results: SearchResult[];
  isLoading?: boolean;
  onSelect?: (result: SearchResult) => void;
  maxResults?: number;
  showSimilarity?: boolean;
  className?: string;
}

export function SearchSuggestions({
  results,
  isLoading = false,
  onSelect,
  maxResults = 5,
  showSimilarity = true,
  className,
}: SearchSuggestionsProps) {
  const [selectedIndex, setSelectedIndex] = React.useState(-1);
  const displayResults = results.slice(0, maxResults);

  // Reset selection when results change
  React.useEffect(() => {
    setSelectedIndex(-1);
  }, [results]);

  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (displayResults.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => (prev < displayResults.length - 1 ? prev + 1 : 0));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : displayResults.length - 1));
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && displayResults[selectedIndex]) {
            onSelect?.(displayResults[selectedIndex]);
          }
          break;
        case 'Escape':
          setSelectedIndex(-1);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [displayResults, selectedIndex, onSelect]);

  if (isLoading) {
    return (
      <div
        className={cn(
          'absolute top-full left-0 right-0 mt-1 bg-popover border rounded-lg shadow-lg p-4 z-50',
          className,
        )}
        style={{ backgroundColor: 'hsl(var(--popover))' }}
      >
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span>Searching...</span>
        </div>
      </div>
    );
  }

  if (displayResults.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        'absolute top-full left-0 right-0 mt-1 bg-popover border rounded-lg shadow-lg overflow-hidden z-50',
        className,
      )}
      style={{ backgroundColor: 'hsl(var(--popover))' }}
    >
      <div className="max-h-[300px] overflow-y-auto">
        {displayResults.map((result) => {
          const globalIndex = displayResults.indexOf(result);
          const isSelected = globalIndex === selectedIndex;

          return (
            <Link
              key={result.id}
              href={result.url}
              onClick={() => onSelect?.(result)}
              className={cn(
                'flex items-center gap-3 px-3 py-2 hover:bg-accent transition-colors',
                isSelected && 'bg-accent',
              )}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-md border bg-background shrink-0">
                <FileText className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{result.title}</p>
                {result.subtitle && <p className="text-xs text-muted-foreground truncate">{result.subtitle}</p>}
              </div>
              {showSimilarity && result.similarity !== undefined && result.similarity > 0 && (
                <div className="flex items-center gap-2 shrink-0">
                  <Progress value={result.similarity * 100} className="w-16 h-1.5" />
                  <Badge variant="secondary" className="text-xs tabular-nums">
                    {Math.round(result.similarity * 100)}%
                  </Badge>
                </div>
              )}
            </Link>
          );
        })}
      </div>
      <div className="border-t px-3 py-2 text-xs text-muted-foreground flex items-center justify-between bg-muted/30">
        <span>
          <kbd className="px-1 py-0.5 rounded bg-muted font-mono text-xs">↑↓</kbd> to navigate
          <span className="mx-2">•</span>
          <kbd className="px-1 py-0.5 rounded bg-muted font-mono text-xs">↵</kbd> to select
        </span>
        <span>{displayResults.length} results</span>
      </div>
    </div>
  );
}
