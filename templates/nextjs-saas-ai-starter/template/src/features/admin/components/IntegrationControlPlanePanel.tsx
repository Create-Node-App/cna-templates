'use client';

import { Loader2, Play } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui';

type Provider = 'github' | 'google_workspace';
type Mode = 'migration_full' | 'sync_incremental' | 'reconcile' | 'dry_run';

interface IntegrationControlPlanePanelProps {
  tenantSlug: string;
}

interface SyncRunRow {
  id: string;
  provider: Provider;
  mode: Mode;
  status: string;
  createdAt: string;
}

interface ConflictRow {
  id: string;
  entityType: string;
  conflictType: string;
  severity: string;
  status: string;
}

interface Metrics {
  runsTotal: number;
  runsCompleted: number;
  runsFailed: number;
  conflictsOpen: number;
  avgRunTimeSeconds: number;
}

interface FieldMappingRow {
  id: string;
  entityType: string;
  fieldPath: string;
  ownership: string;
  isEnabled: boolean;
}

interface Readiness {
  ready: boolean;
  checks: Array<{ key: string; passed: boolean; value: number | string }>;
}

const PROVIDER_TO_ENDPOINT: Record<Provider, string> = {
  github: 'github',
  google_workspace: 'google-workspace',
};

export function IntegrationControlPlanePanel({ tenantSlug }: IntegrationControlPlanePanelProps) {
  const t = useTranslations('admin.integrationsControl');
  const [provider, setProvider] = useState<Provider>('github');
  const [mode, setMode] = useState<Mode>('sync_incremental');
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [progress, setProgress] = useState<string[]>([]);
  const [runs, setRuns] = useState<SyncRunRow[]>([]);
  const [conflicts, setConflicts] = useState<ConflictRow[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [mappings, setMappings] = useState<FieldMappingRow[]>([]);
  const [readiness, setReadiness] = useState<Readiness | null>(null);
  const [mappingEntityType, setMappingEntityType] = useState('');
  const [mappingFieldPath, setMappingFieldPath] = useState('');
  const [mappingOwnership, setMappingOwnership] = useState<
    'remote_authoritative' | 'local_authoritative' | 'merge' | 'append_only'
  >('merge');
  const [savingMapping, setSavingMapping] = useState(false);
  const [resolvingConflictId, setResolvingConflictId] = useState<string | null>(null);

  const refreshOpsData = useCallback(async () => {
    const [runsRes, conflictsRes, metricsRes, mappingsRes, readinessRes] = await Promise.all([
      fetch(`/api/tenants/${tenantSlug}/admin/integrations/runs?provider=${provider}&limit=10`),
      fetch(`/api/tenants/${tenantSlug}/admin/integrations/conflicts?provider=${provider}&onlyOpen=true&limit=10`),
      fetch(`/api/tenants/${tenantSlug}/admin/integrations/metrics?provider=${provider}&days=14`),
      fetch(`/api/tenants/${tenantSlug}/admin/integrations/field-mappings?provider=${provider}`),
      fetch(`/api/tenants/${tenantSlug}/admin/integrations/readiness?provider=${provider}`),
    ]);
    if (runsRes.ok) {
      const data = (await runsRes.json()) as { runs: SyncRunRow[] };
      setRuns(data.runs ?? []);
    }
    if (conflictsRes.ok) {
      const data = (await conflictsRes.json()) as { conflicts: ConflictRow[] };
      setConflicts(data.conflicts ?? []);
    }
    if (metricsRes.ok) {
      const data = (await metricsRes.json()) as { metrics: Metrics };
      setMetrics(data.metrics);
    }
    if (mappingsRes.ok) {
      const data = (await mappingsRes.json()) as { mappings: FieldMappingRow[] };
      setMappings(data.mappings ?? []);
    }
    if (readinessRes.ok) {
      const data = (await readinessRes.json()) as { readiness: Readiness };
      setReadiness(data.readiness);
    }
  }, [provider, tenantSlug]);

  useEffect(() => {
    void refreshOpsData();
  }, [refreshOpsData]);

  const endpoint = useMemo(() => PROVIDER_TO_ENDPOINT[provider], [provider]);

  const handleRun = useCallback(async () => {
    setIsRunning(true);
    setResult(null);
    setProgress([]);
    try {
      const body = {};

      const res = await fetch(`/api/tenants/${tenantSlug}/admin/integrations/${endpoint}/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const payload = (await res.json()) as { error?: string };
        setResult({ success: false, message: payload.error ?? t('unknownError') });
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) {
        setResult({ success: false, message: t('unknownError') });
        return;
      }
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        for (const line of lines) {
          if (!line.trim()) continue;
          const data = JSON.parse(line) as { type?: string; message?: string; success?: boolean; error?: string };
          if (data.type === 'progress') {
            setProgress((prev) => [...prev, data.message ?? '...']);
          } else if (data.type === 'result' || data.type === 'complete') {
            setResult({
              success: data.success ?? true,
              message: data.error ?? t('runCompleted'),
            });
          }
        }
      }
      await refreshOpsData();
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : t('unknownError'),
      });
    } finally {
      setIsRunning(false);
    }
  }, [endpoint, mode, provider, refreshOpsData, t, tenantSlug]);

  const resolveConflict = useCallback(
    async (conflictId: string) => {
      setResolvingConflictId(conflictId);
      try {
        await fetch(`/api/tenants/${tenantSlug}/admin/integrations/conflicts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ conflictId, action: 'resolved_from_control_plane', status: 'resolved' }),
        });
        await refreshOpsData();
      } finally {
        setResolvingConflictId(null);
      }
    },
    [refreshOpsData, tenantSlug],
  );

  const saveFieldMapping = useCallback(async () => {
    if (!mappingEntityType || !mappingFieldPath) return;
    setSavingMapping(true);
    try {
      await fetch(`/api/tenants/${tenantSlug}/admin/integrations/field-mappings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          entityType: mappingEntityType,
          fieldPath: mappingFieldPath,
          ownership: mappingOwnership,
          isEnabled: true,
        }),
      });
      setMappingEntityType('');
      setMappingFieldPath('');
      await refreshOpsData();
    } finally {
      setSavingMapping(false);
    }
  }, [mappingEntityType, mappingFieldPath, mappingOwnership, provider, refreshOpsData, tenantSlug]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>{t('provider')}</Label>
            <Select value={provider} onValueChange={(value) => setProvider(value as Provider)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="github">GitHub</SelectItem>
                <SelectItem value="google_workspace">Google Workspace</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t('mode')}</Label>
            <Select value={mode} onValueChange={(value) => setMode(value as Mode)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sync_incremental">{t('incremental')}</SelectItem>
                <SelectItem value="migration_full">{t('full')}</SelectItem>
                <SelectItem value="reconcile">{t('reconcile')}</SelectItem>
                <SelectItem value="dry_run">{t('dryRun')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={handleRun} disabled={isRunning}>
          {isRunning ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Play className="h-4 w-4 mr-2" />}
          {t('run')}
        </Button>

        {result ? (
          <Alert variant={result.success ? 'default' : 'destructive'}>
            <AlertTitle>{result.success ? t('runCompleted') : t('runFailed')}</AlertTitle>
            <AlertDescription>{result.message}</AlertDescription>
          </Alert>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-md border p-3 space-y-1">
            <p className="text-sm font-medium">{t('metrics')}</p>
            {metrics ? (
              <>
                <p className="text-xs text-muted-foreground">{t('runsTotal', { value: metrics.runsTotal })}</p>
                <p className="text-xs text-muted-foreground">{t('runsCompleted', { value: metrics.runsCompleted })}</p>
                <p className="text-xs text-muted-foreground">{t('runsFailed', { value: metrics.runsFailed })}</p>
                <p className="text-xs text-muted-foreground">
                  {t('conflictsOpenCount', { value: metrics.conflictsOpen })}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t('avgRunTimeSeconds', { value: Math.round(metrics.avgRunTimeSeconds) })}
                </p>
              </>
            ) : (
              <p className="text-xs text-muted-foreground">{t('noMetrics')}</p>
            )}
          </div>
          <div className="rounded-md border p-3 space-y-1">
            <p className="text-sm font-medium">{t('readiness')}</p>
            {readiness ? (
              <>
                <p className="text-xs text-muted-foreground">
                  {readiness.ready ? t('readinessReady') : t('readinessNotReady')}
                </p>
                {readiness.checks.map((check) => (
                  <p key={check.key} className="text-xs text-muted-foreground">
                    {check.passed ? 'OK' : 'KO'} - {check.key}: {String(check.value)}
                  </p>
                ))}
              </>
            ) : (
              <p className="text-xs text-muted-foreground">{t('noMetrics')}</p>
            )}
          </div>
          <div className="rounded-md border p-3 space-y-2">
            <p className="text-sm font-medium">{t('recentRuns')}</p>
            {runs.length === 0 ? (
              <p className="text-xs text-muted-foreground">{t('noRuns')}</p>
            ) : (
              runs.map((run) => (
                <p key={run.id} className="text-xs text-muted-foreground font-mono">
                  {run.id} - {run.mode} - {run.status}
                </p>
              ))
            )}
          </div>
          <div className="rounded-md border p-3 space-y-2">
            <p className="text-sm font-medium">{t('openConflicts')}</p>
            {conflicts.length === 0 ? (
              <p className="text-xs text-muted-foreground">{t('noConflicts')}</p>
            ) : (
              conflicts.map((conflict) => (
                <div key={conflict.id} className="flex items-center justify-between gap-2">
                  <p className="text-xs text-muted-foreground">
                    {conflict.entityType}: {conflict.conflictType}
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => void resolveConflict(conflict.id)}
                    disabled={resolvingConflictId === conflict.id}
                  >
                    {resolvingConflictId === conflict.id ? <Loader2 className="h-4 w-4 animate-spin" /> : t('resolve')}
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-md border p-3 space-y-3">
          <p className="text-sm font-medium">{t('fieldMappings')}</p>
          <div className="grid gap-3 md:grid-cols-3">
            <Input
              value={mappingEntityType}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => setMappingEntityType(event.target.value)}
              placeholder={t('mappingEntityPlaceholder')}
            />
            <Input
              value={mappingFieldPath}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => setMappingFieldPath(event.target.value)}
              placeholder={t('mappingFieldPlaceholder')}
            />
            <Select
              value={mappingOwnership}
              onValueChange={(value) => setMappingOwnership(value as typeof mappingOwnership)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="remote_authoritative">{t('ownershipRemote')}</SelectItem>
                <SelectItem value="local_authoritative">{t('ownershipLocal')}</SelectItem>
                <SelectItem value="merge">{t('ownershipMerge')}</SelectItem>
                <SelectItem value="append_only">{t('ownershipAppendOnly')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={saveFieldMapping} disabled={savingMapping || !mappingEntityType || !mappingFieldPath}>
            {savingMapping ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            {t('saveMapping')}
          </Button>
          {mappings.length === 0 ? (
            <p className="text-xs text-muted-foreground">{t('noMappings')}</p>
          ) : (
            mappings.slice(0, 10).map((mapping) => (
              <p key={mapping.id} className="text-xs text-muted-foreground">
                {mapping.entityType}.{mapping.fieldPath} - {mapping.ownership}
              </p>
            ))
          )}
        </div>

        {progress.length > 0 ? (
          <div className="rounded-md border p-3 space-y-1 max-h-48 overflow-y-auto">
            {progress.map((line, index) => (
              <p key={`${line}-${index}`} className="text-xs text-muted-foreground font-mono">
                {line}
              </p>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
