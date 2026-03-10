'use client';

/**
 * Multi-Select Filter Component
 *
 * Filter component that allows selecting multiple options with search capability.
 */

import { ChevronsUpDown, X } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import { ScrollArea } from '@/shared/components/ui/scroll-area';

interface MultiSelectFilterProps {
  options: string[];
  selected: string[];
  onSelectionChange: (selected: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  maxDisplay?: number;
  className?: string;
}

export function MultiSelectFilter({
  options,
  selected,
  onSelectionChange,
  placeholder = 'Select options...',
  searchPlaceholder = 'Search...',
  emptyMessage = 'No options found.',
  maxDisplay = 3,
  className,
}: MultiSelectFilterProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    const query = searchQuery.toLowerCase();
    return options.filter((option) => option.toLowerCase().includes(query));
  }, [options, searchQuery]);

  const toggleOption = (option: string) => {
    const newSelected = selected.includes(option) ? selected.filter((s) => s !== option) : [...selected, option];
    onSelectionChange(newSelected);
  };

  const removeOption = (option: string) => {
    onSelectionChange(selected.filter((s) => s !== option));
  };

  const clearAll = () => {
    onSelectionChange([]);
  };

  const selectAll = () => {
    onSelectionChange([...filteredOptions]);
  };

  const allFilteredSelected = filteredOptions.length > 0 && filteredOptions.every((o) => selected.includes(o));

  return (
    <div className={className}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between min-h-10 h-auto py-2"
          >
            <div className="flex flex-wrap gap-1 flex-1">
              {selected.length === 0 ? (
                <span className="text-muted-foreground">{placeholder}</span>
              ) : (
                <>
                  {selected.slice(0, maxDisplay).map((option) => (
                    <Badge key={option} variant="secondary" className="text-xs">
                      {option}
                    </Badge>
                  ))}
                  {selected.length > maxDisplay && (
                    <Badge variant="secondary" className="text-xs">
                      +{selected.length - maxDisplay} more
                    </Badge>
                  )}
                </>
              )}
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <div className="p-2 border-b">
            <Input
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="border-b p-2 flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={selectAll}
              className="h-7 text-xs"
              disabled={allFilteredSelected || filteredOptions.length === 0}
            >
              Select all
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="h-7 text-xs"
              disabled={selected.length === 0}
            >
              Clear
            </Button>
          </div>
          <ScrollArea className="max-h-60">
            <div className="p-2">
              {filteredOptions.length === 0 ? (
                <div className="py-6 text-center text-sm text-muted-foreground">{emptyMessage}</div>
              ) : (
                <div className="space-y-2">
                  {filteredOptions.map((option) => {
                    const isSelected = selected.includes(option);
                    return (
                      <div
                        key={option}
                        className="flex items-center space-x-2 cursor-pointer"
                        onClick={() => toggleOption(option)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            toggleOption(option);
                          }
                        }}
                        role="button"
                        tabIndex={0}
                      >
                        <Checkbox id={`option-${option}`} checked={isSelected} />
                        <Label htmlFor={`option-${option}`} className="text-sm font-normal cursor-pointer flex-1">
                          {option}
                        </Label>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </ScrollArea>
          {selected.length > 0 && (
            <div className="border-t p-2 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{selected.length} selected</span>
              <Button variant="ghost" size="sm" onClick={clearAll} className="h-7 text-xs">
                Clear
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {selected.map((option) => (
            <Badge
              key={option}
              variant="secondary"
              className="text-xs cursor-pointer"
              onClick={() => removeOption(option)}
            >
              {option}
              <X className="ml-1 h-3 w-3" />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
