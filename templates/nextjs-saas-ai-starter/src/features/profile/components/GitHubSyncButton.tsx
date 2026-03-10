'use client';

import { AlertCircle, CheckCircle2, Code2, Github, Loader2, RefreshCw, Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui';

interface GitHubSyncButtonProps {
  tenantSlug: string;
  githubUsername: string;
  isGitHubEnabled: boolean;
  isPersonallyConnected?: boolean;
}

export function GitHubSyncButton({
  tenantSlug,
  githubUsername,
  isGitHubEnabled,
  isPersonallyConnected,
}: GitHubSyncButtonProps) {
  const t = useTranslations('profile.settings');
  const [isSyncing, setIsSyncing] = useState(false);
  const [progressMessages, setProgressMessages] = useState<string[]>([]);
  const [syncResult, setSyncResult] = useState<{
    totalReposScanned: number;
    totalSkillsInferred: number;
    languagesFound?: string[];
  } | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  if (!isGitHubEnabled) {
    return (
      <Card className="border-dashed">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 text-muted-foreground">
            <Github className="h-4 w-4" />
            {t('githubSyncTitle')}
          </CardTitle>
          <CardDescription>{t('githubSyncNotEnabled')}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const handleSync = async () => {
    setIsSyncing(true);
    setProgressMessages([]);
    setSyncResult(null);
    setSyncError(null);

    try {
      const response = await fetch(`/api/tenants/${tenantSlug}/profile/github-sync`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

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
          try {
            const data = JSON.parse(line);

            if (data.type === 'progress' && data.message) {
              setProgressMessages((prev) => [...prev, data.message]);
            } else if (data.type === 'complete' && data.result) {
              setSyncResult({
                totalReposScanned: data.result.totalReposScanned,
                totalSkillsInferred: data.result.totalSkillsInferred,
                languagesFound: data.result.results?.[0]?.languagesFound,
              });
            } else if (data.type === 'error') {
              setSyncError(data.error ?? 'Unknown error');
            }
          } catch {
            // Skip malformed lines
          }
        }
      }
    } catch (err) {
      setSyncError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-base flex items-center gap-2">
              <Github className="h-4 w-4 text-muted-foreground" />
              {t('githubSyncTitle')}
            </CardTitle>
            <CardDescription>{t('githubSyncDescription', { username: githubUsername })}</CardDescription>
          </div>
          <Badge
            variant="outline"
            className={`shrink-0 gap-1 font-mono text-xs ${isPersonallyConnected ? 'text-green-600 dark:text-green-400 border-green-300 dark:border-green-800' : ''}`}
          >
            <Github className="h-3 w-3" />@{githubUsername}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={handleSync} disabled={isSyncing} variant="outline" size="sm">
          {isSyncing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
          {isSyncing ? t('githubSyncing') : t('githubSyncNow')}
        </Button>

        {/* Progress */}
        {isSyncing && progressMessages.length > 0 && (
          <div className="max-h-32 overflow-y-auto space-y-0.5 rounded-md bg-muted/50 border p-3 text-xs font-mono">
            {progressMessages.map((msg, i) => (
              <div key={i} className="text-muted-foreground flex items-start gap-2">
                <span className="text-muted-foreground/50 select-none">&gt;</span>
                {msg}
              </div>
            ))}
          </div>
        )}

        {/* Result */}
        {syncResult && (
          <Alert className="border-green-200 dark:border-green-500/20 bg-green-50/50 dark:bg-green-500/[0.07]">
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertTitle className="text-green-800 dark:text-green-300">{t('githubSyncComplete')}</AlertTitle>
            <AlertDescription>
              <div className="mt-2 flex flex-wrap gap-3">
                <div className="flex items-center gap-1.5 text-sm">
                  <Code2 className="h-3.5 w-3.5 text-muted-foreground" />
                  {t('githubSyncRepos', { count: syncResult.totalReposScanned })}
                </div>
                <div className="flex items-center gap-1.5 text-sm">
                  <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />
                  {t('githubSyncSkills', { count: syncResult.totalSkillsInferred })}
                </div>
              </div>
              {syncResult.languagesFound && syncResult.languagesFound.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  <span className="text-xs text-muted-foreground mr-1">{t('githubSyncLanguages')}:</span>
                  {syncResult.languagesFound.slice(0, 12).map((lang) => (
                    <Badge key={lang} variant="secondary" className="text-[10px] px-1.5 py-0">
                      {lang}
                    </Badge>
                  ))}
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Error */}
        {syncError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{t('githubSyncError')}</AlertTitle>
            <AlertDescription>{syncError}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
