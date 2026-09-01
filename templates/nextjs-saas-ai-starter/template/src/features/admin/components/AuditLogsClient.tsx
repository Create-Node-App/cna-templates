'use client';

/**
 * Audit Logs Admin Page Client
 *
 * Client component for viewing and filtering audit events.
 */

import { Calendar, ChevronDown, ChevronUp, Filter, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useState } from 'react';

import { AdminPageHeader } from '@/features/admin';
import type { AuditLogEntry, AuditLogFilters } from '@/features/admin/services/audit-logs-service';
import { exportAuditEventsCSV, listAuditEvents } from '@/features/admin/services/audit-logs-service';
import type { PaginatedResult } from '@/features/admin/types';
import { Badge, Button, Input, Select, SelectItem } from '@/shared/components/ui';

interface AuditLogsClientProps {
  tenantSlug: string;
  initialData: PaginatedResult<AuditLogEntry>;
  availableActions: string[];
  availableEntityTypes: string[];
  availableActors: Array<{ id: string; name: string; email: string | null }>;
}

type DatePreset = 'today' | 'week' | 'month' | 'custom' | 'all';

function getDateRange(preset: DatePreset): { startDate?: Date; endDate?: Date } {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (preset) {
    case 'today':
      return { startDate: today, endDate: new Date(today.getTime() + 24 * 60 * 60 * 1000) };
    case 'week':
      return { startDate: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000), endDate: now };
    case 'month':
      return { startDate: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000), endDate: now };
    case 'all':
    default:
      return {};
  }
}

function formatTimestamp(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date(date));
}

function formatActionLabel(action: string): string {
  // Convert 'skill.created' to 'Skill Created'
  return action
    .split('.')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function getActionColor(action: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (action.includes('deleted')) return 'destructive';
  if (action.includes('created')) return 'default';
  if (action.includes('updated')) return 'secondary';
  return 'outline';
}

export function AuditLogsClient({
  tenantSlug,
  initialData,
  availableActions,
  availableEntityTypes,
  availableActors,
}: AuditLogsClientProps) {
  const t = useTranslations('auditLogs');
  const [data, setData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [isExporting, setIsExporting] = useState(false);
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  // Filters
  const [datePreset, setDatePreset] = useState<DatePreset>('all');
  const [selectedActor, setSelectedActor] = useState<string>('all');
  const [selectedAction, setSelectedAction] = useState<string>('all');
  const [selectedEntityType, setSelectedEntityType] = useState<string>('all');
  const [entityIdFilter, setEntityIdFilter] = useState('');
  const [searchFilter, setSearchFilter] = useState('');

  const buildFilters = useCallback((): AuditLogFilters => {
    const filters: AuditLogFilters = {};

    const dateRange = getDateRange(datePreset);
    if (dateRange.startDate) filters.startDate = dateRange.startDate;
    if (dateRange.endDate) filters.endDate = dateRange.endDate;

    if (selectedActor && selectedActor !== 'all') filters.actorId = selectedActor;
    if (selectedAction && selectedAction !== 'all') filters.actions = [selectedAction];
    if (selectedEntityType && selectedEntityType !== 'all') filters.entityTypes = [selectedEntityType];
    if (entityIdFilter) filters.entityId = entityIdFilter;
    if (searchFilter) filters.search = searchFilter;

    return filters;
  }, [datePreset, selectedActor, selectedAction, selectedEntityType, entityIdFilter, searchFilter]);

  const fetchData = useCallback(
    async (page = 1) => {
      setIsLoading(true);
      try {
        const filters = buildFilters();
        const result = await listAuditEvents(tenantSlug, { ...filters, page, pageSize: 50 });
        if (result.success && result.data) {
          setData(result.data);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [tenantSlug, buildFilters],
  );

  const handleFilterChange = useCallback(() => {
    fetchData(1);
  }, [fetchData]);

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const filters = buildFilters();
      const result = await exportAuditEventsCSV(tenantSlug, filters);
      if (result.success && result.data) {
        // Download CSV
        const blob = new Blob([result.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } finally {
      setIsExporting(false);
    }
  };

  const clearFilters = () => {
    setDatePreset('all');
    setSelectedActor('all');
    setSelectedAction('all');
    setSelectedEntityType('all');
    setEntityIdFilter('');
    setSearchFilter('');
    fetchData(1);
  };

  const hasActiveFilters =
    datePreset !== 'all' ||
    selectedActor !== 'all' ||
    selectedAction !== 'all' ||
    selectedEntityType !== 'all' ||
    entityIdFilter ||
    searchFilter;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t('title')}
        description={t('description')}
        backHref={`/t/${tenantSlug}/admin`}
        backLabel="Admin"
        actionLabel={isExporting ? 'Exporting...' : t('export')}
        onAction={handleExport}
      />

      {/* Filters */}
      <div className="rounded-lg border bg-card">
        <button
          onClick={() => setFiltersExpanded(!filtersExpanded)}
          className="flex w-full items-center justify-between p-4 transition-colors hover:bg-muted/50"
        >
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">{t('filters.title') || 'Filters'}</span>
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2">
                {
                  [
                    datePreset !== 'all' && 'Date',
                    selectedActor !== 'all' && 'Actor',
                    selectedAction !== 'all' && 'Action',
                    selectedEntityType !== 'all' && 'Type',
                    entityIdFilter && 'ID',
                    searchFilter && 'Search',
                  ].filter(Boolean).length
                }{' '}
                active
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  clearFilters();
                }}
              >
                <X className="mr-1 h-4 w-4" />
                {t('filters.clear') || 'Clear'}
              </Button>
            )}
            {filtersExpanded ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
        </button>

        {filtersExpanded && (
          <div className="border-t p-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {/* Date Range */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  <Calendar className="mr-1 inline h-3.5 w-3.5" />
                  {t('filters.dateRange')}
                </label>
                <Select value={datePreset} onValueChange={(v) => setDatePreset(v as DatePreset)}>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Last 7 Days</SelectItem>
                  <SelectItem value="month">Last 30 Days</SelectItem>
                </Select>
              </div>

              {/* Actor */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{t('filters.actor')}</label>
                <Select value={selectedActor} onValueChange={setSelectedActor}>
                  <SelectItem value="all">All Actors</SelectItem>
                  {availableActors.map((actor) => (
                    <SelectItem key={actor.id} value={actor.id}>
                      {actor.name || actor.email || 'Unknown'}
                    </SelectItem>
                  ))}
                </Select>
              </div>

              {/* Action */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{t('filters.action')}</label>
                <Select value={selectedAction} onValueChange={setSelectedAction}>
                  <SelectItem value="all">All Actions</SelectItem>
                  {availableActions.map((action) => (
                    <SelectItem key={action} value={action}>
                      {formatActionLabel(action)}
                    </SelectItem>
                  ))}
                </Select>
              </div>

              {/* Entity Type */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  {t('filters.entityType')}
                </label>
                <Select value={selectedEntityType} onValueChange={setSelectedEntityType}>
                  <SelectItem value="all">All Types</SelectItem>
                  {availableEntityTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </Select>
              </div>

              {/* Search */}
              <div className="sm:col-span-2 lg:col-span-1">
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{t('filters.search')}</label>
                <Input
                  placeholder={t('filters.search')}
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleFilterChange()}
                />
              </div>

              {/* Entity ID Filter */}
              <div className="sm:col-span-2 lg:col-span-1">
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  {t('filters.entityId') || 'Entity ID'}
                </label>
                <Input
                  placeholder={t('filters.entityId') || 'Entity ID'}
                  value={entityIdFilter}
                  onChange={(e) => setEntityIdFilter(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleFilterChange()}
                />
              </div>

              {/* Apply Button */}
              <div className="flex items-end sm:col-span-2 lg:col-span-1 xl:col-span-2">
                <Button onClick={handleFilterChange} disabled={isLoading} className="w-full">
                  {isLoading ? 'Loading...' : t('filters.apply') || 'Apply Filters'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="rounded-lg border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="w-8 px-4 py-3"></th>
                <th className="px-4 py-3 text-left font-medium">{t('columns.timestamp')}</th>
                <th className="px-4 py-3 text-left font-medium">{t('columns.actor')}</th>
                <th className="px-4 py-3 text-left font-medium">{t('columns.action')}</th>
                <th className="px-4 py-3 text-left font-medium">{t('columns.entity')}</th>
              </tr>
            </thead>
            <tbody>
              {data.items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    {t('noResults')}
                  </td>
                </tr>
              ) : (
                data.items.map((event) => (
                  <>
                    <tr
                      key={event.id}
                      className="cursor-pointer border-b transition-colors hover:bg-muted/30"
                      onClick={() => toggleRow(event.id)}
                    >
                      <td className="px-4 py-3">
                        {expandedRows.has(event.id) ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{formatTimestamp(event.timestamp)}</td>
                      <td className="px-4 py-3">
                        {event.actorName || event.actorEmail || <span className="text-muted-foreground">System</span>}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={getActionColor(event.action)}>{formatActionLabel(event.action)}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs">
                          {event.entityType}
                          {event.entityId && (
                            <span className="text-muted-foreground">/{event.entityId.slice(0, 8)}...</span>
                          )}
                        </span>
                      </td>
                    </tr>
                    {expandedRows.has(event.id) && (
                      <tr key={`${event.id}-details`} className="border-b bg-muted/20">
                        <td colSpan={5} className="px-4 py-4">
                          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            <div>
                              <span className="text-xs font-medium uppercase text-muted-foreground">Entity ID</span>
                              <p className="font-mono text-sm">{event.entityId || 'N/A'}</p>
                            </div>
                            <div>
                              <span className="text-xs font-medium uppercase text-muted-foreground">Request ID</span>
                              <p className="font-mono text-sm">{event.requestId || 'N/A'}</p>
                            </div>
                            <div>
                              <span className="text-xs font-medium uppercase text-muted-foreground">IP Address</span>
                              <p className="font-mono text-sm">{event.ipAddress || 'N/A'}</p>
                            </div>
                            {event.aiModelVersion && (
                              <div>
                                <span className="text-xs font-medium uppercase text-muted-foreground">AI Model</span>
                                <p className="text-sm">{event.aiModelVersion}</p>
                              </div>
                            )}
                            {event.changes && Object.keys(event.changes).length > 0 && (
                              <div className="md:col-span-2 lg:col-span-3">
                                <span className="text-xs font-medium uppercase text-muted-foreground">Changes</span>
                                <pre className="mt-1 max-h-32 overflow-auto rounded bg-muted/50 p-2 text-xs">
                                  {JSON.stringify(event.changes, null, 2)}
                                </pre>
                              </div>
                            )}
                            {event.metadata && Object.keys(event.metadata).length > 0 && (
                              <div className="md:col-span-2 lg:col-span-3">
                                <span className="text-xs font-medium uppercase text-muted-foreground">Metadata</span>
                                <pre className="mt-1 max-h-32 overflow-auto rounded bg-muted/50 p-2 text-xs">
                                  {JSON.stringify(event.metadata, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data.totalPages > 1 && (
          <div className="flex items-center justify-between border-t px-4 py-3">
            <span className="text-sm text-muted-foreground">
              Showing {(data.page - 1) * data.pageSize + 1} - {Math.min(data.page * data.pageSize, data.total)} of{' '}
              {data.total} events
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={data.page <= 1 || isLoading}
                onClick={() => fetchData(data.page - 1)}
              >
                Previous
              </Button>
              <span className="flex items-center px-2 text-sm">
                Page {data.page} of {data.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={data.page >= data.totalPages || isLoading}
                onClick={() => fetchData(data.page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
