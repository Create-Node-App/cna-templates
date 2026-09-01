'use client';

/**
 * Admin Data Table
 *
 * Reusable data table component for admin lists.
 */

import { ChevronLeft, ChevronRight, Copy, Loader2, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { Button, Card, CardContent, Input } from '@/shared/components/ui';
import { cn } from '@/shared/lib/utils';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface AdminDataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  isLoading?: boolean;
  searchPlaceholder?: string;
  onSearch?: (search: string) => void;
  onPageChange?: (page: number) => void;
  onRowClick?: (item: T) => void;
  onDelete?: (item: T) => void;
  onDuplicate?: (item: T) => void;
  getRowKey: (item: T) => string;
  emptyMessage?: string;
}

export function AdminDataTable<T>({
  columns,
  data,
  total,
  page,
  pageSize,
  totalPages,
  isLoading,
  searchPlaceholder = 'Search...',
  onSearch,
  onPageChange,
  onRowClick,
  onDelete,
  onDuplicate,
  getRowKey,
  emptyMessage = 'No items found',
}: AdminDataTableProps<T>) {
  const hasActions = onDelete || onDuplicate;
  const [searchValue, setSearchValue] = useState('');
  const [focusedRowIndex, setFocusedRowIndex] = useState(-1);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchValue);
  };

  return (
    <Card className="rounded-xl border-0 shadow-md">
      <CardContent className="p-0">
        {/* Search Bar */}
        {onSearch && (
          <div className="border-b p-4">
            <form onSubmit={handleSearch} className="flex gap-2" role="search" aria-label="Search table">
              <div className="relative flex-1">
                <Search
                  className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  placeholder={searchPlaceholder}
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="pl-10"
                  aria-label={searchPlaceholder}
                />
              </div>
              <Button type="submit" variant="outline">
                Search
              </Button>
            </form>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto" role="region" aria-label="Data table">
          <table className="w-full" role="grid" aria-busy={isLoading}>
            <thead>
              <tr className="border-b bg-muted/50" role="row">
                {columns.map((column) => (
                  <th
                    key={column.key}
                    scope="col"
                    role="columnheader"
                    className={cn(
                      'px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground',
                      column.className,
                    )}
                  >
                    {column.header}
                  </th>
                ))}
                {hasActions && (
                  <th scope="col" className="w-24 px-4 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                <tr>
                  <td colSpan={columns.length + (hasActions ? 1 : 0)} className="py-12 text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" aria-hidden="true" />
                    <span className="sr-only">Loading data...</span>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + (hasActions ? 1 : 0)}
                    className="py-12 text-center text-muted-foreground"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                data.map((item, index) => (
                  <tr
                    key={getRowKey(item)}
                    tabIndex={onRowClick ? (focusedRowIndex === index ? 0 : -1) : undefined}
                    aria-selected={focusedRowIndex === index}
                    onClick={() => onRowClick?.(item)}
                    onKeyDown={(e) => {
                      if (onRowClick && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        onRowClick(item);
                      }
                    }}
                    onFocus={() => setFocusedRowIndex(index)}
                    className={cn(
                      'transition-colors',
                      onRowClick &&
                        'cursor-pointer hover:bg-accent focus:outline-none focus:bg-primary/5 focus:ring-2 focus:ring-inset focus:ring-primary',
                      focusedRowIndex === index && 'bg-primary/5',
                    )}
                  >
                    {columns.map((column) => (
                      <td key={column.key} className={cn('px-4 py-3 text-sm text-foreground', column.className)}>
                        {column.render
                          ? column.render(item)
                          : String((item as Record<string, unknown>)[column.key] ?? '')}
                      </td>
                    ))}
                    {hasActions && (
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          {onDuplicate && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDuplicate(item);
                              }}
                              aria-label="Duplicate item"
                              className="text-muted-foreground hover:bg-muted hover:text-foreground"
                            >
                              <Copy className="h-4 w-4" aria-hidden="true" />
                            </Button>
                          )}
                          {onDelete && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDelete(item);
                              }}
                              aria-label="Delete item"
                              className="text-red-600 hover:bg-red-50 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" aria-hidden="true" />
                            </Button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <nav className="flex items-center justify-between border-t px-4 py-3" aria-label="Table pagination">
            <p className="text-sm text-muted-foreground" aria-live="polite">
              Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, total)} of {total}
            </p>
            <div className="flex gap-1" role="group" aria-label="Pagination controls">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(page - 1)}
                disabled={page <= 1}
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(page + 1)}
                disabled={page >= totalPages}
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </nav>
        )}
      </CardContent>
    </Card>
  );
}
