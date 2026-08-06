'use client';

/**
 * Semantic Search Input Component
 *
 * Search input with semantic search capabilities and autocomplete suggestions.
 */

import { Search, Sparkles, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';

interface SemanticSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: (query: string) => void;
  placeholder?: string;
  debounceMs?: number;
  showSemanticIndicator?: boolean;
  searchMethod?: 'semantic' | 'text' | null;
  className?: string;
}

export function SemanticSearchInput({
  value,
  onChange,
  onSearch,
  placeholder = 'Search...',
  debounceMs = 300,
  showSemanticIndicator = true,
  searchMethod = null,
  className,
}: SemanticSearchInputProps) {
  const [_isFocused, setIsFocused] = useState(false);
  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const handleChange = useCallback(
    (newValue: string) => {
      onChange(newValue);

      // Clear existing timeout
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      // Set new timeout for search
      if (onSearch) {
        debounceTimeoutRef.current = setTimeout(() => {
          onSearch(newValue);
        }, debounceMs);
      }
    },
    [onChange, onSearch, debounceMs],
  );

  const handleClear = useCallback(() => {
    onChange('');
    if (onSearch) {
      onSearch('');
    }
  }, [onChange, onSearch]);

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const showClearButton = value.length > 0;

  return (
    <div className={`relative ${className || ''}`}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="pl-10 pr-20"
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
        {showSemanticIndicator && searchMethod === 'semantic' && (
          <Badge
            variant="secondary"
            className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-0 hidden sm:flex"
          >
            <Sparkles className="h-3 w-3 mr-1" />
            Semantic
          </Badge>
        )}
        {showClearButton && (
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-muted" onClick={handleClear} type="button">
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
}
