'use client';

/**
 * Command Palette Component
 *
 * Global search accessible via Cmd+K (Mac) / Ctrl+K (Windows)
 * Provides semantic search across all entity types with quick navigation.
 * Supports entity type filtering like ClickUp's command palette.
 */

import { Command } from 'cmdk';
import {
  BookOpen,
  Clock,
  FileText,
  Filter,
  GraduationCap,
  Loader2,
  Map,
  Search,
  Sparkles,
  User,
  Wrench,
  X,
  Zap,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { cn } from '@/shared/lib/utils';
import { useTenant } from '@/shared/providers';

import { useGlobalSearchOptional } from './GlobalSearchProvider';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Dialog, DialogContent } from '../ui/dialog';

interface SearchResult {
  id: string;
  type: 'skill' | 'capability' | 'person' | 'knowledge' | 'roadmap' | 'training' | 'role_profile';
  title: string;
  subtitle?: string;
  similarity?: number;
  url: string;
}

type EntityFilter = 'all' | 'role_profile' | 'training' | 'roadmap' | 'capability';

interface EntityFilterConfig {
  id: EntityFilter;
  label: string;
  icon: React.ReactNode;
  shortcut?: string;
}

const ENTITY_FILTERS: EntityFilterConfig[] = [
  { id: 'all', label: 'All', icon: <Search className="h-3 w-3" />, shortcut: '1' },
  { id: 'role_profile', label: 'Roles', icon: <User className="h-3 w-3" />, shortcut: '2' },
  { id: 'training', label: 'Trainings', icon: <GraduationCap className="h-3 w-3" />, shortcut: '3' },
  { id: 'roadmap', label: 'Roadmaps', icon: <Map className="h-3 w-3" />, shortcut: '4' },
  { id: 'capability', label: 'Capabilities', icon: <Zap className="h-3 w-3" />, shortcut: '5' },
];

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
  const [entityFilter, setEntityFilter] = useState<EntityFilter>('all');

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
      setEntityFilter('all');
    }
  }, [open]);

  // Handle keyboard shortcuts for filter switching
  useEffect(() => {
    if (!open) return;

    const handleFilterShortcut = (e: KeyboardEvent) => {
      // Only handle if not typing in input
      if ((e.target as HTMLElement).tagName === 'INPUT') return;

      const filter = ENTITY_FILTERS.find((f) => f.shortcut === e.key);
      if (filter) {
        e.preventDefault();
        setEntityFilter(filter.id);
      }
    };

    document.addEventListener('keydown', handleFilterShortcut);
    return () => document.removeEventListener('keydown', handleFilterShortcut);
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
        const allResults: SearchResult[] = [];

        // Determine which searches to run based on filter
        const searchKnowledge =
          entityFilter === 'all' || ['role_profile', 'training', 'roadmap'].includes(entityFilter);
        const searchCapabilities = entityFilter === 'all' || entityFilter === 'capability';

        // Build knowledge search params with type filter
        if (searchKnowledge) {
          const knowledgeParams = new URLSearchParams({
            q: query,
            limit: entityFilter === 'all' ? '10' : '20',
            semantic: 'true',
          });

          // Add type filter if specific knowledge type selected
          if (entityFilter !== 'all' && entityFilter !== 'capability') {
            knowledgeParams.set('type', entityFilter);
          }

          const knowledgeRes = await fetch(`/api/tenants/${tenant.slug}/knowledge/search?${knowledgeParams}`, {
            signal: controller.signal,
          });

          if (knowledgeRes.ok) {
            const knowledgeData = await knowledgeRes.json();
            setSearchMethod(knowledgeData.searchMethod || 'text');

            for (const doc of knowledgeData.results || []) {
              allResults.push({
                id: doc.id,
                type: doc.docType,
                title: doc.title,
                subtitle: doc.snippet || doc.tags?.slice(0, 3).join(', '),
                similarity: doc.similarity,
                url: `/t/${tenant.slug}/knowledge/${doc.slug}`,
              });
            }
          }
        }

        // Search capabilities
        if (searchCapabilities) {
          const capabilitiesRes = await fetch(
            `/api/tenants/${tenant.slug}/capabilities/search?q=${encodeURIComponent(query)}&limit=${entityFilter === 'capability' ? '20' : '5'}&semantic=true`,
            { signal: controller.signal },
          );

          if (capabilitiesRes.ok) {
            const capData = await capabilitiesRes.json();
            for (const cap of capData.results || []) {
              allResults.push({
                id: cap.id,
                type: 'capability',
                title: cap.name,
                subtitle: cap.description?.substring(0, 80),
                similarity: cap.similarity,
                url: `/t/${tenant.slug}/capabilities/${cap.slug}`,
              });
            }
          }
        }

        // Sort by similarity if available
        allResults.sort((a, b) => (b.similarity || 0) - (a.similarity || 0));
        setResults(allResults.slice(0, 15));
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
  }, [query, tenant?.slug, entityFilter]);

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

  const getIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'role_profile':
        return <User className="h-4 w-4" />;
      case 'training':
        return <GraduationCap className="h-4 w-4" />;
      case 'roadmap':
        return <Map className="h-4 w-4" />;
      case 'capability':
        return <Zap className="h-4 w-4" />;
      case 'skill':
        return <Wrench className="h-4 w-4" />;
      case 'person':
        return <User className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: SearchResult['type']) => {
    switch (type) {
      case 'role_profile':
        return 'Role Profile';
      case 'training':
        return 'Training';
      case 'roadmap':
        return 'Roadmap';
      case 'capability':
        return 'Capability';
      case 'skill':
        return 'Skill';
      case 'person':
        return 'Person';
      default:
        return 'Document';
    }
  };

  // Group results by type
  const groupedResults = results.reduce(
    (acc, result) => {
      const group = result.type;
      if (!acc[group]) acc[group] = [];
      acc[group].push(result);
      return acc;
    },
    {} as Record<string, SearchResult[]>,
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="overflow-hidden p-0 shadow-lg max-w-2xl">
        <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Command.Input
              placeholder={
                entityFilter === 'all'
                  ? 'Search everything...'
                  : `Search ${ENTITY_FILTERS.find((f) => f.id === entityFilter)?.label.toLowerCase()}...`
              }
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

          {/* Entity Type Filters */}
          <div className="flex items-center gap-1 px-3 py-2 border-b bg-muted/30">
            <Filter className="h-3 w-3 text-muted-foreground mr-1" />
            {ENTITY_FILTERS.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setEntityFilter(filter.id)}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors',
                  entityFilter === filter.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background hover:bg-accent text-muted-foreground hover:text-foreground',
                )}
              >
                {filter.icon}
                <span>{filter.label}</span>
                {filter.shortcut && (
                  <kbd className="ml-1 px-1 py-0.5 rounded bg-muted/50 text-[10px] font-mono">{filter.shortcut}</kbd>
                )}
              </button>
            ))}
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
                    <p>
                      Start typing to search
                      {entityFilter !== 'all'
                        ? ` ${ENTITY_FILTERS.find((f) => f.id === entityFilter)?.label.toLowerCase()}`
                        : ''}
                      ...
                    </p>
                    <p className="text-xs mt-1 opacity-75">
                      Use natural language like &quot;how to deploy to AWS&quot;
                    </p>
                    {entityFilter !== 'all' && (
                      <Badge variant="secondary" className="mt-2 text-xs">
                        Filtering: {ENTITY_FILTERS.find((f) => f.id === entityFilter)?.label}
                      </Badge>
                    )}
                  </Command.Empty>
                )}
              </>
            )}

            {query.trim() !== '' && results.length === 0 && !isSearching && (
              <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
                <p>No results found for &quot;{query}&quot;</p>
                {entityFilter !== 'all' && (
                  <p className="text-xs mt-2">
                    Searching in: {ENTITY_FILTERS.find((f) => f.id === entityFilter)?.label}
                    <button onClick={() => setEntityFilter('all')} className="ml-2 text-primary hover:underline">
                      Search all?
                    </button>
                  </p>
                )}
              </Command.Empty>
            )}

            {Object.entries(groupedResults).map(([type, typeResults]) => (
              <Command.Group key={type} heading={getTypeLabel(type as SearchResult['type'])}>
                {typeResults.map((result) => (
                  <Command.Item
                    key={result.id}
                    value={result.title}
                    onSelect={() => handleSelect(result.url)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 cursor-pointer hover:bg-accent aria-selected:bg-accent"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-md border bg-background">
                      {getIcon(result.type)}
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
            ))}
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
                <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono">1-5</kbd> filter
              </span>
              <span>
                <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono">esc</kbd> close
              </span>
            </div>
            <div className="flex items-center gap-2">
              {entityFilter !== 'all' && (
                <Badge variant="outline" className="text-[10px] h-5">
                  {ENTITY_FILTERS.find((f) => f.id === entityFilter)?.label}
                </Badge>
              )}
              <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono">⌘K</kbd>
            </div>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
