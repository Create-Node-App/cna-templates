'use client';

/**
 * Multi-select by id: options with id+name, selectedIds, Find (search), Select all, Clear.
 */

import { ChevronsUpDown } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Button } from '@/shared/components/ui/button';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Input } from '@/shared/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import { ScrollArea } from '@/shared/components/ui/scroll-area';

export interface OptionById {
  id: number;
  name: string;
}

interface MultiSelectByIdProps {
  options: OptionById[];
  selectedIds: number[];
  onSelectionChange: (ids: number[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  className?: string;
}

export function MultiSelectById({
  options,
  selectedIds,
  onSelectionChange,
  placeholder = 'Select…',
  searchPlaceholder = 'Find…',
  emptyMessage = 'No options found.',
  className,
}: MultiSelectByIdProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    const q = searchQuery.toLowerCase();
    return options.filter((o) => o.name.toLowerCase().includes(q));
  }, [options, searchQuery]);

  const toggle = (id: number) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((s) => s !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  const selectAll = () => {
    const ids = filteredOptions.map((o) => o.id);
    const combined = new Set([...selectedIds, ...ids]);
    onSelectionChange(Array.from(combined));
  };

  const clearAll = () => {
    onSelectionChange([]);
  };

  const allFilteredSelected = filteredOptions.length > 0 && filteredOptions.every((o) => selectedIds.includes(o.id));

  return (
    <div className={className}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-between font-normal" role="combobox" aria-expanded={open}>
            {selectedIds.length === 0 ? placeholder : `${selectedIds.length} selected`}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-0" align="start">
          <div className="p-2 border-b">
            <Input
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8"
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
              disabled={selectedIds.length === 0}
            >
              Clear
            </Button>
          </div>
          <ScrollArea className="max-h-60">
            <div className="p-2">
              {filteredOptions.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">{emptyMessage}</p>
              ) : (
                <div className="space-y-0">
                  {filteredOptions.map((o) => (
                    <label
                      key={o.id}
                      className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted/60"
                    >
                      <Checkbox checked={selectedIds.includes(o.id)} onCheckedChange={() => toggle(o.id)} />
                      <span className="text-sm">{o.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
          {selectedIds.length > 0 && (
            <div className="border-t p-2">
              <span className="text-sm text-muted-foreground">{selectedIds.length} selected</span>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
