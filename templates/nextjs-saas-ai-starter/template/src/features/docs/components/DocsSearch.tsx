'use client';

import Fuse from 'fuse.js';
import { FileText, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Dialog, DialogContent, DialogTitle } from '@/shared/components/ui';
import { cn } from '@/shared/lib/utils';

import type { SearchIndexItem } from '../lib/docs-search-index';

interface DocsSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DocsSearch({ open, onOpenChange }: DocsSearchProps) {
  const t = useTranslations();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [searchIndex, setSearchIndex] = useState<SearchIndexItem[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(0);

  // Load search index on first open
  useEffect(() => {
    if (open && searchIndex.length === 0) {
      fetch('/api/docs/search-index')
        .then((res) => res.json())
        .then((data) => setSearchIndex(data))
        .catch(() => {});
    }
  }, [open, searchIndex.length]);

  /* eslint-disable react-hooks/set-state-in-effect -- Reset search state when dialog open state changes */
  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIdx(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const fuse = useMemo(() => {
    return new Fuse(searchIndex, {
      keys: [
        { name: 'title', weight: 3 },
        { name: 'description', weight: 2 },
        { name: 'content', weight: 1 },
      ],
      threshold: 0.4,
      includeMatches: true,
      minMatchCharLength: 2,
    });
  }, [searchIndex]);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    return fuse.search(query, { limit: 10 });
  }, [fuse, query]);

  const navigate = useCallback(
    (slug: string) => {
      onOpenChange(false);
      router.push(`/docs/${slug}`);
    },
    [onOpenChange, router],
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIdx((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIdx((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIdx]) {
      navigate(results[selectedIdx].item.slug);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="top-[20%] max-w-lg translate-y-0 gap-0 overflow-hidden p-0 sm:top-[20%]">
        <DialogTitle className="sr-only">{t('docs.search.placeholder')}</DialogTitle>
        {/* Search input */}
        <div className="flex items-center border-b border-border px-4">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIdx(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder={t('docs.search.placeholder')}
            className="flex-1 bg-transparent px-3 py-3 text-sm outline-none placeholder:text-muted-foreground"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-xs text-muted-foreground hover:text-foreground">
              {t('common.cancel')}
            </button>
          )}
        </div>

        {/* Results */}
        <div className="max-h-[300px] overflow-y-auto p-2">
          {query.trim() === '' ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center text-sm text-muted-foreground">
              <Search className="h-8 w-8 opacity-30" />
              <p>{t('docs.search.hint')}</p>
            </div>
          ) : results.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">{t('docs.search.noResults')}</div>
          ) : (
            <ul role="listbox">
              {results.map((result, idx) => (
                <li key={result.item.slug} role="option" aria-selected={idx === selectedIdx}>
                  <button
                    onClick={() => navigate(result.item.slug)}
                    onMouseEnter={() => setSelectedIdx(idx)}
                    className={cn(
                      'flex w-full items-start gap-3 rounded-md px-3 py-2.5 text-left transition-colors',
                      idx === selectedIdx ? 'bg-primary/10 text-foreground' : 'text-muted-foreground hover:bg-muted',
                    )}
                  >
                    <FileText className="mt-0.5 h-4 w-4 shrink-0" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{result.item.title}</p>
                      {result.item.description && (
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">{result.item.description}</p>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-4 border-t border-border px-4 py-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-border bg-muted px-1 font-mono text-[10px]">↑↓</kbd>
            {t('docs.search.navigate')}
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-border bg-muted px-1 font-mono text-[10px]">↵</kbd>
            {t('docs.search.open')}
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-border bg-muted px-1 font-mono text-[10px]">esc</kbd>
            {t('docs.search.close')}
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
