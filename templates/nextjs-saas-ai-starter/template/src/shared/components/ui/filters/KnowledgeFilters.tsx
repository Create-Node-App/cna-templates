'use client';

/**
 * Knowledge Filters Component
 *
 * Advanced filtering for knowledge documents with type, tags, relevance, date, and status filters.
 */

import { Calendar, Filter, Tag, X } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Label } from '@/shared/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Slider } from '@/shared/components/ui/slider';

export interface KnowledgeFilters {
  types: string[];
  tags: string[];
  minRelevance: number;
  status: string | null;
  dateRange: 'all' | 'recent' | 'old';
}

interface KnowledgeFiltersProps {
  availableTags: string[];
  onFiltersChange: (filters: KnowledgeFilters) => void;
  initialFilters?: Partial<KnowledgeFilters>;
}

export function KnowledgeFilters({ availableTags, onFiltersChange, initialFilters }: KnowledgeFiltersProps) {
  const [filters, setFilters] = useState<KnowledgeFilters>({
    types: initialFilters?.types || [],
    tags: initialFilters?.tags || [],
    minRelevance: initialFilters?.minRelevance ?? 0,
    status: initialFilters?.status || null,
    dateRange: initialFilters?.dateRange || 'all',
  });

  const [isOpen, setIsOpen] = useState(false);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.types.length > 0) count++;
    if (filters.tags.length > 0) count++;
    if (filters.minRelevance > 0) count++;
    if (filters.status) count++;
    if (filters.dateRange !== 'all') count++;
    return count;
  }, [filters]);

  const updateFilters = (updates: Partial<KnowledgeFilters>) => {
    const newFilters = { ...filters, ...updates };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const toggleType = (type: string) => {
    const newTypes = filters.types.includes(type) ? filters.types.filter((t) => t !== type) : [...filters.types, type];
    updateFilters({ types: newTypes });
  };

  const toggleTag = (tag: string) => {
    const newTags = filters.tags.includes(tag) ? filters.tags.filter((t) => t !== tag) : [...filters.tags, tag];
    updateFilters({ tags: newTags });
  };

  const clearFilters = () => {
    const clearedFilters: KnowledgeFilters = {
      types: [],
      tags: [],
      minRelevance: 0,
      status: null,
      dateRange: 'all',
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const docTypes = [
    { value: 'role_profile', label: 'Role Profiles' },
    { value: 'roadmap', label: 'Roadmaps' },
    { value: 'training', label: 'Trainings' },
    { value: 'capability_doc', label: 'Capability Docs' },
  ];

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <Filter className="mr-2 h-4 w-4" />
          Filters
          {activeFiltersCount > 0 && (
            <Badge
              variant="secondary"
              className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <CardHeader className="p-0 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Filters</CardTitle>
            {activeFiltersCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 text-xs">
                Clear all
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0 space-y-6">
          {/* Document Type Filter */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Document Type</Label>
            <div className="space-y-2">
              {docTypes.map((type) => (
                <div key={type.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`type-${type.value}`}
                    checked={filters.types.includes(type.value)}
                    onCheckedChange={() => toggleType(type.value)}
                  />
                  <Label htmlFor={`type-${type.value}`} className="text-sm font-normal cursor-pointer">
                    {type.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Tags Filter */}
          {availableTags.length > 0 && (
            <div>
              <Label className="text-sm font-medium mb-2 block flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Tags
              </Label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {availableTags.map((tag) => (
                  <div key={tag} className="flex items-center space-x-2">
                    <Checkbox
                      id={`tag-${tag}`}
                      checked={filters.tags.includes(tag)}
                      onCheckedChange={() => toggleTag(tag)}
                    />
                    <Label htmlFor={`tag-${tag}`} className="text-sm font-normal cursor-pointer">
                      {tag}
                    </Label>
                  </div>
                ))}
              </div>
              {filters.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {filters.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="text-xs cursor-pointer"
                      onClick={() => toggleTag(tag)}
                    >
                      {tag}
                      <X className="ml-1 h-3 w-3" />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Relevance Level Filter */}
          <div>
            <Label className="text-sm font-medium mb-2 block">
              Minimum Relevance: {Math.round(filters.minRelevance * 100)}%
            </Label>
            <Slider
              value={[filters.minRelevance]}
              onValueChange={([value]) => updateFilters({ minRelevance: value })}
              min={0}
              max={1}
              step={0.05}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Status</Label>
            <Select
              value={filters.status || 'all'}
              onValueChange={(value) => updateFilters({ status: value === 'all' ? null : value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range Filter */}
          <div>
            <Label className="text-sm font-medium mb-2 block flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Date Range
            </Label>
            <Select
              value={filters.dateRange}
              onValueChange={(value) => updateFilters({ dateRange: value as KnowledgeFilters['dateRange'] })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Dates</SelectItem>
                <SelectItem value="recent">Recent (Last 30 days)</SelectItem>
                <SelectItem value="old">Older (30+ days)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </PopoverContent>
    </Popover>
  );
}
