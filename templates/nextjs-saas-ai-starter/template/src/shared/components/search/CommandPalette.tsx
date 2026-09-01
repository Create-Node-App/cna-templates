'use client';

/**
 * Command Palette Component
 *
 * Global search accessible via Cmd+K (Mac) / Ctrl+K (Windows)
 * Provides semantic search across knowledge base with quick navigation.
 */

import { Command } from 'cmdk';
import { BookOpen, Clock, FileText, Loader2, Search, Sparkles, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { useTenant } from '@/shared/providers';

import { useGlobalSearchOptional } from './GlobalSearchProvider';
import { Button } from '../ui/button';
import { Dialog, DialogContent } from '../ui/dialog';

interface SearchResult {
  id: string;
  type: string;
  title: string;
  subtitle?: string;
  similarity?: number;
  url: string;
}

interface CommandPaletteProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CommandPalette({ open: controlledOpen, onOpenChange }: CommandPaletteProps) {
  const globalSearch = useGlobalSearchOptional();
  const [internalOpen, setInternalOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchMethod, setSearchMethod] = useState<'semantic' | 'text' | null>(null);

  const router = useRouter();
  const tenant = useTenant();

  // Use global search state if available, otherwise use internal state
  const open = controlledOpen ?? globalSearch?.isCommandPaletteOpen ?? internalOpen;
  const setOpen = onOpenChange ?? globalSearch?.toggleCommandPalette ?? setInternalOpen;

  // Keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(!open);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, setOpen]);

  // Clear state when closing
  useEffect(() => {
    if (!open) {
      setQuery('');
      setResults([]);
      setSearchMethod(null);
    }
  }, [open]);

  // Debounced search
  useEffect(() => {
    if (!query.trim() || !tenant?.slug) {
      setResults([]);
      setSearchMethod(null);
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(async () => {
      setIsSearching(true);
      try {
        const knowledgeParams = new URLSearchParams({
          q: query,
          limit: '15',
          semantic: 'true',
        });

        const knowledgeRes = await fetch(`/api/tenants/${tenant.slug}/knowledge/search?${knowledgeParams}`, {
          signal: controller.signal,
        });

        if (knowledgeRes.ok) {
          const knowledgeData = await knowledgeRes.json();
          setSearchMethod(knowledgeData.searchMethod || 'text');

          const allResults: SearchResult[] = [];
          for (const doc of knowledgeData.results || []) {
            allResults.push({
              id: doc.id,
              type: doc.docType || 'document',
              title: doc.title,
              subtitle: doc.snippet || doc.tags?.slice(0, 3).join(', '),
              similarity: doc.similarity,
              url: `/t/${tenant.slug}/knowledge/${doc.slug}`,
            });
          }

          setResults(allResults);
        }
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Search error:', error);
        }
      } finally {
        setIsSearching(false);
      }
    }, 200);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [query, tenant?.slug]);

  const handleSelect = useCallback(
    (url: string) => {
      // Add to recent searches if we have a query
      if (query.trim() && globalSearch) {
        globalSearch.addRecentSearch(query);
      }
      setOpen(false);
      router.push(url);
    },
    [router, setOpen, query, globalSearch],
  );

  const handleRecentSearchClick = useCallback((recentQuery: string) => {
    setQuery(recentQuery);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="overflow-hidden p-0 shadow-lg max-w-2xl">
        <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Command.Input
              placeholder="Search knowledge base..."
              value={query}
              onValueChange={setQuery}
              className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
            {isSearching && <Loader2 className="h-4 w-4 animate-spin opacity-50" />}
            {searchMethod === 'semantic' && !isSearching && (
              <div className="flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400">
                <Sparkles className="h-3 w-3" />
                <span>Semantic</span>
              </div>
            )}
          </div>

          <Command.List className="max-h-[400px] overflow-y-auto p-2">
            {query.trim() === '' && (
              <>
                {/* Recent Searches */}
                {globalSearch && globalSearch.recentSearches.length > 0 && (
                  <Command.Group heading="Recent Searches">
                    <div className="flex items-center justify-between px-2 py-1">
                      <span className="text-xs text-muted-foreground">{globalSearch.recentSearches.length} recent</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          globalSearch.clearRecentSearches();
                        }}
                      >
                        <X className="h-3 w-3 mr-1" />
                        Clear
                      </Button>
                    </div>
                    {globalSearch.recentSearches.slice(0, 5).map((recent) => (
                      <Command.Item
                        key={recent.timestamp}
                        value={recent.query}
                        onSelect={() => handleRecentSearchClick(recent.query)}
                        className="flex items-center gap-3 rounded-lg px-3 py-2 cursor-pointer hover:bg-accent"
                      >
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{recent.query}</span>
                      </Command.Item>
                    ))}
                  </Command.Group>
                )}

                {/* Empty state hint */}
                {(!globalSearch || globalSearch.recentSearches.length === 0) && (
                  <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
                    <BookOpen className="mx-auto mb-2 h-8 w-8 opacity-50" />
                    <p>Start typing to search...</p>
                    <p className="text-xs mt-1 opacity-75">
                      Use natural language like &quot;how to deploy to AWS&quot;
                    </p>
                  </Command.Empty>
                )}
              </>
            )}

            {query.trim() !== '' && results.length === 0 && !isSearching && (
              <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
                <p>No results found for &quot;{query}&quot;</p>
              </Command.Empty>
            )}

            {results.length > 0 && (
              <Command.Group heading="Results">
                {results.map((result) => (
                  <Command.Item
                    key={result.id}
                    value={result.title}
                    onSelect={() => handleSelect(result.url)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 cursor-pointer hover:bg-accent aria-selected:bg-accent"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-md border bg-background">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="truncate font-medium">{result.title}</p>
                      {result.subtitle && <p className="truncate text-xs text-muted-foreground">{result.subtitle}</p>}
                    </div>
                    {result.similarity !== undefined && result.similarity > 0 && (
                      <div className="text-xs text-muted-foreground">{Math.round(result.similarity * 100)}%</div>
                    )}
                  </Command.Item>
                ))}
              </Command.Group>
            )}
          </Command.List>

          <div className="border-t px-3 py-2 text-xs text-muted-foreground flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span>
                <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono">↑↓</kbd> navigate
              </span>
              <span>
                <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono">↵</kbd> select
              </span>
              <span>
                <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono">esc</kbd> close
              </span>
            </div>
            <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono">⌘K</kbd>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
