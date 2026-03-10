'use client';

import { Check, ChevronsUpDown, X } from 'lucide-react';
import { useCallback, useMemo, useRef, useState } from 'react';

import { cn } from '@/shared/lib/utils';

import { Button } from './button';
import { Input } from './input';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { ScrollArea } from './scroll-area';

export interface EntityComboboxProps<T> {
  value: string | null;
  onChange: (value: string | null) => void;
  options: T[];
  getOptionValue: (option: T) => string;
  getOptionLabel: (option: T) => string;
  getOptionSearchText?: (option: T) => string;
  renderOption: (option: T, isSelected: boolean) => React.ReactNode;
  renderSelectedValue?: (option: T) => React.ReactNode;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  allowClear?: boolean;
  disabled?: boolean;
  className?: string;
}

export function EntityCombobox<T>({
  value,
  onChange,
  options,
  getOptionValue,
  getOptionLabel,
  getOptionSearchText,
  renderOption,
  renderSelectedValue,
  placeholder = 'Select…',
  searchPlaceholder = 'Search…',
  emptyMessage = 'No results found.',
  allowClear = true,
  disabled = false,
  className,
}: EntityComboboxProps<T>) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOption = useMemo(
    () => (value ? (options.find((o) => getOptionValue(o) === value) ?? null) : null),
    [value, options, getOptionValue],
  );

  const filtered = useMemo(() => {
    if (!query.trim()) return options;
    const q = query.toLowerCase();
    return options.filter((o) => {
      const searchText = getOptionSearchText?.(o) ?? getOptionLabel(o);
      return searchText.toLowerCase().includes(q);
    });
  }, [options, query, getOptionLabel, getOptionSearchText]);

  const handleSelect = useCallback(
    (optionValue: string) => {
      onChange(optionValue === value ? null : optionValue);
      setOpen(false);
      setQuery('');
    },
    [onChange, value],
  );

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange(null);
    },
    [onChange],
  );

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (nextOpen) {
          setQuery('');
          setTimeout(() => inputRef.current?.focus(), 0);
        }
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn('w-full justify-between font-normal h-auto min-h-9 px-3 py-1.5', className)}
        >
          <span className="flex-1 text-left truncate">
            {selectedOption ? (
              renderSelectedValue ? (
                renderSelectedValue(selectedOption)
              ) : (
                <span className="text-sm">{getOptionLabel(selectedOption)}</span>
              )
            ) : (
              <span className="text-muted-foreground text-sm">{placeholder}</span>
            )}
          </span>
          <span className="flex items-center gap-1 shrink-0 ml-1">
            {allowClear && selectedOption && (
              <span
                role="button"
                tabIndex={-1}
                onClick={handleClear}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') handleClear(e as unknown as React.MouseEvent);
                }}
                className="rounded-sm p-0.5 hover:bg-muted transition-colors"
              >
                <X className="h-3.5 w-3.5 text-muted-foreground" />
              </span>
            )}
            <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 opacity-50" />
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <div className="p-2 border-b">
          <Input
            ref={inputRef}
            placeholder={searchPlaceholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-8 text-sm"
          />
        </div>
        <ScrollArea className="max-h-64">
          <div className="p-1">
            {filtered.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">{emptyMessage}</p>
            ) : (
              filtered.map((option) => {
                const optVal = getOptionValue(option);
                const isSelected = optVal === value;
                return (
                  <button
                    key={optVal}
                    type="button"
                    className={cn(
                      'w-full flex items-start gap-2 rounded-md px-2 py-1.5 text-left hover:bg-muted/60 transition-colors cursor-pointer',
                      isSelected && 'bg-muted/40',
                    )}
                    onClick={() => handleSelect(optVal)}
                  >
                    <Check className={cn('h-4 w-4 mt-0.5 shrink-0', isSelected ? 'opacity-100' : 'opacity-0')} />
                    <div className="flex-1 min-w-0">{renderOption(option, isSelected)}</div>
                  </button>
                );
              })
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

export interface EntityMultiComboboxProps<T> {
  value: string[];
  onChange: (value: string[]) => void;
  options: T[];
  getOptionValue: (option: T) => string;
  getOptionLabel: (option: T) => string;
  getOptionSearchText?: (option: T) => string;
  renderOption: (option: T, isSelected: boolean) => React.ReactNode;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  className?: string;
}

export function EntityMultiCombobox<T>({
  value,
  onChange,
  options,
  getOptionValue,
  getOptionLabel,
  getOptionSearchText,
  renderOption,
  placeholder = 'Select…',
  searchPlaceholder = 'Search…',
  emptyMessage = 'No results found.',
  disabled = false,
  className,
}: EntityMultiComboboxProps<T>) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOptions = useMemo(
    () => options.filter((o) => value.includes(getOptionValue(o))),
    [value, options, getOptionValue],
  );

  const filtered = useMemo(() => {
    if (!query.trim()) return options;
    const q = query.toLowerCase();
    return options.filter((o) => {
      const searchText = getOptionSearchText?.(o) ?? getOptionLabel(o);
      return searchText.toLowerCase().includes(q);
    });
  }, [options, query, getOptionLabel, getOptionSearchText]);

  const handleToggle = useCallback(
    (optionValue: string) => {
      if (value.includes(optionValue)) {
        onChange(value.filter((v) => v !== optionValue));
      } else {
        onChange([...value, optionValue]);
      }
    },
    [onChange, value],
  );

  const handleRemove = useCallback(
    (e: React.MouseEvent, optionValue: string) => {
      e.stopPropagation();
      onChange(value.filter((v) => v !== optionValue));
    },
    [onChange, value],
  );

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (nextOpen) {
          setQuery('');
          setTimeout(() => inputRef.current?.focus(), 0);
        }
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn('w-full justify-between font-normal h-auto min-h-9 px-3 py-1.5', className)}
        >
          <span className="flex-1 text-left">
            {selectedOptions.length > 0 ? (
              <span className="flex flex-wrap gap-1">
                {selectedOptions.map((opt) => (
                  <span
                    key={getOptionValue(opt)}
                    className="inline-flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 text-xs"
                  >
                    {getOptionLabel(opt)}
                    <span
                      role="button"
                      tabIndex={-1}
                      onClick={(e) => handleRemove(e, getOptionValue(opt))}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ')
                          handleRemove(e as unknown as React.MouseEvent, getOptionValue(opt));
                      }}
                      className="rounded-sm hover:bg-muted-foreground/20 p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </span>
                  </span>
                ))}
              </span>
            ) : (
              <span className="text-muted-foreground text-sm">{placeholder}</span>
            )}
          </span>
          <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 opacity-50 ml-1" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <div className="p-2 border-b">
          <Input
            ref={inputRef}
            placeholder={searchPlaceholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-8 text-sm"
          />
        </div>
        <ScrollArea className="max-h-64">
          <div className="p-1">
            {filtered.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">{emptyMessage}</p>
            ) : (
              filtered.map((option) => {
                const optVal = getOptionValue(option);
                const isSelected = value.includes(optVal);
                return (
                  <button
                    key={optVal}
                    type="button"
                    className={cn(
                      'w-full flex items-start gap-2 rounded-md px-2 py-1.5 text-left hover:bg-muted/60 transition-colors cursor-pointer',
                      isSelected && 'bg-muted/40',
                    )}
                    onClick={() => handleToggle(optVal)}
                  >
                    <Check className={cn('h-4 w-4 mt-0.5 shrink-0', isSelected ? 'opacity-100' : 'opacity-0')} />
                    <div className="flex-1 min-w-0">{renderOption(option, isSelected)}</div>
                  </button>
                );
              })
            )}
          </div>
        </ScrollArea>
        {value.length > 0 && (
          <div className="border-t p-2 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{value.length} selected</span>
            <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => onChange([])}>
              Clear all
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
