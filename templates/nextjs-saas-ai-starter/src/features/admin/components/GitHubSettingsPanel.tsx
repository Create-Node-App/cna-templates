'use client';

import { CheckCircle, Github, Link2Off, Loader2, RefreshCw, Settings, Unlink } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState, useTransition } from 'react';

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
  Switch,
} from '@/shared/components/ui';

import { disconnectGitHub, updateGitHubSettings } from '../services/github-settings-service';

interface GitHubSettingsPanelProps {
  tenantSlug: string;
  settings:
    | {
        enabled?: boolean;
        organizationFilter?: string;
        syncRepositories?: boolean;
        inferSkills?: boolean;
        syncContributions?: boolean;
        includeArchived?: boolean;
        includeForks?: boolean;
        contributionDaysLookback?: number;
      }
    | undefined;
  isConnected: boolean;
  connectedGithubUsername?: string;
  hasEnvCredentials?: boolean;
}

export function GitHubSettingsPanel({
  tenantSlug,
  settings,
  isConnected,
  connectedGithubUsername,
  hasEnvCredentials,
}: GitHubSettingsPanelProps) {
  const t = useTranslations('admin.github');
  const router = useRouter();

  const [isPending, startTransition] = useTransition();
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Local state
  const [enabled, setEnabled] = useState(settings?.enabled ?? false);
  const [orgFilter, setOrgFilter] = useState(settings?.organizationFilter ?? '');
  const [syncRepositories, setSyncRepositories] = useState(settings?.syncRepositories ?? true);
  const [inferSkills, setInferSkills] = useState(settings?.inferSkills ?? true);
  const [syncContributions, setSyncContributions] = useState(settings?.syncContributions ?? true);
  const [includeArchived, setIncludeArchived] = useState(settings?.includeArchived ?? false);
  const [includeForks, setIncludeForks] = useState(settings?.includeForks ?? false);
  const [lookbackDays, setLookbackDays] = useState(settings?.contributionDaysLookback ?? 365);

  const handleSave = () => {
    setSaveStatus('saving');
    startTransition(async () => {
      const result = await updateGitHubSettings(tenantSlug, {
        enabled,
        organizationFilter: orgFilter.trim() || undefined,
        syncRepositories,
        inferSkills,
        syncContributions,
        includeArchived,
        includeForks,
        contributionDaysLookback: lookbackDays,
      });

      if (result.success) {
        setSaveStatus('saved');
        router.refresh();
        setTimeout(() => setSaveStatus('idle'), 2000);
      } else {
        setSaveStatus('error');
      }
    });
  };

  const handleDisconnect = async () => {
    if (!confirm(t('settings.confirmDisconnect'))) return;

    setIsDisconnecting(true);
    try {
      const result = await disconnectGitHub(tenantSlug);
      if (result.success) {
        router.refresh();
      }
    } finally {
      setIsDisconnecting(false);
    }
  };

  const handleConnect = () => {
    const returnUrl = `/t/${tenantSlug}/admin/integrations/github`;
    window.location.href = `/api/integrations/github/connect?returnUrl=${encodeURIComponent(returnUrl)}`;
  };

  return (
    <div className="space-y-6">
      {/* Connection Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isConnected ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <Link2Off className="h-5 w-5 text-muted-foreground" />
            )}
            {t('settings.connectionStatus')}
          </CardTitle>
          <CardDescription>
            {isConnected
              ? t('settings.connectedAs', { username: connectedGithubUsername ?? 'Unknown' })
              : t('settings.notConnected')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {hasEnvCredentials && (
            <Alert>
              <AlertTitle>{t('settings.envConfigured')}</AlertTitle>
              <AlertDescription>{t('settings.envConfiguredDesc')}</AlertDescription>
            </Alert>
          )}
          <div className="flex gap-2 flex-wrap">
            {isConnected ? (
              <>
                <Button variant="outline" size="sm" onClick={handleConnect}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {t('settings.reconnect')}
                </Button>
                <Button variant="destructive" size="sm" onClick={handleDisconnect} disabled={isDisconnecting}>
                  {isDisconnecting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Unlink className="h-4 w-4 mr-2" />
                  )}
                  {t('settings.disconnect')}
                </Button>
                {connectedGithubUsername && (
                  <Button variant="ghost" size="sm" asChild>
                    <a href={`https://github.com/${connectedGithubUsername}`} target="_blank" rel="noopener noreferrer">
                      <Github className="h-4 w-4 mr-2" />@{connectedGithubUsername}
                    </a>
                  </Button>
                )}
              </>
            ) : (
              <Button onClick={handleConnect}>{t('settings.connect')}</Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Integration Settings Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            {t('settings.integrationSettings')}
          </CardTitle>
          <CardDescription>{t('settings.integrationSettingsDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable Integration */}
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">{t('settings.enableIntegration')}</Label>
              <p className="text-xs text-muted-foreground">{t('settings.enableIntegrationDesc')}</p>
            </div>
            <Switch checked={enabled} onCheckedChange={setEnabled} />
          </div>

          {enabled && (
            <>
              {/* Organization Filter */}
              <div className="space-y-2">
                <Label>{t('settings.organizationFilter')}</Label>
                <p className="text-xs text-muted-foreground">{t('settings.organizationFilterDesc')}</p>
                <Input
                  value={orgFilter}
                  onChange={(e) => setOrgFilter(e.target.value)}
                  placeholder={t('settings.organizationFilterPlaceholder')}
                />
              </div>

              {/* Sync Repositories */}
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">{t('settings.syncRepositories')}</Label>
                  <p className="text-xs text-muted-foreground">{t('settings.syncRepositoriesDesc')}</p>
                </div>
                <Switch checked={syncRepositories} onCheckedChange={setSyncRepositories} />
              </div>

              {/* Infer Skills */}
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">{t('settings.inferSkills')}</Label>
                  <p className="text-xs text-muted-foreground">{t('settings.inferSkillsDesc')}</p>
                </div>
                <Switch checked={inferSkills} onCheckedChange={setInferSkills} />
              </div>

              {/* Sync Contributions */}
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">{t('settings.syncContributions')}</Label>
                  <p className="text-xs text-muted-foreground">{t('settings.syncContributionsDesc')}</p>
                </div>
                <Switch checked={syncContributions} onCheckedChange={setSyncContributions} />
              </div>

              {/* Include Archived */}
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">{t('settings.includeArchived')}</Label>
                  <p className="text-xs text-muted-foreground">{t('settings.includeArchivedDesc')}</p>
                </div>
                <Switch checked={includeArchived} onCheckedChange={setIncludeArchived} />
              </div>

              {/* Include Forks */}
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">{t('settings.includeForks')}</Label>
                  <p className="text-xs text-muted-foreground">{t('settings.includeForksDesc')}</p>
                </div>
                <Switch checked={includeForks} onCheckedChange={setIncludeForks} />
              </div>

              {/* Lookback Days */}
              <div className="space-y-2">
                <Label>{t('settings.lookbackDays')}</Label>
                <p className="text-xs text-muted-foreground">{t('settings.lookbackDaysDesc')}</p>
                <Input
                  type="number"
                  min={30}
                  max={730}
                  value={lookbackDays}
                  onChange={(e) => setLookbackDays(Number(e.target.value))}
                />
              </div>
            </>
          )}

          {/* Save Button */}
          <div className="pt-4 border-t flex items-center justify-between">
            <div>
              {saveStatus === 'saved' && (
                <span className="text-sm text-green-600 flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" />
                  {t('settings.saved')}
                </span>
              )}
              {saveStatus === 'error' && <span className="text-sm text-red-600">{t('settings.saveError')}</span>}
            </div>
            <Button onClick={handleSave} disabled={isPending || saveStatus === 'saving'}>
              {(isPending || saveStatus === 'saving') && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {t('settings.saveSettings')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Warning when disabled */}
      {!enabled && isConnected && (
        <Alert>
          <AlertTitle>{t('settings.disabledWarningTitle')}</AlertTitle>
          <AlertDescription>{t('settings.disabledWarningDesc')}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
