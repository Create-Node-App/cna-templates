'use client';

import { AlertCircle, CheckCircle2, GitBranch, GitPullRequest, Loader2, Play, Search, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import type { GitHubSyncResult } from '@/features/github/types';
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
  Input,
  Label,
  Switch,
} from '@/shared/components/ui';

interface GitHubSyncWizardProps {
  tenantSlug: string;
  settings:
    | {
        organizationFilter?: string;
        syncRepositories?: boolean;
        inferSkills?: boolean;
        syncContributions?: boolean;
      }
    | undefined;
}

type SyncStep = 'org-scan' | 'configure' | 'syncing' | 'complete';

interface SyncResultData {
  totalPersonsProcessed: number;
  totalSkillsInferred: number;
  totalReposScanned: number;
  results: GitHubSyncResult[];
  errors: string[];
}

interface OrgMember {
  githubLogin: string;
  githubId: number;
  avatarUrl: string;
  matchedPersonId: string | null;
  matchedPersonName: string | null;
  matchedPersonEmail: string | null;
  matchStatus: 'matched' | 'unmatched';
}

interface AvailablePerson {
  id: string;
  name: string;
  email: string;
  githubUsername: string | null;
}

export function GitHubSyncWizard({ tenantSlug, settings }: GitHubSyncWizardProps) {
  const t = useTranslations('admin.github');

  const [step, setStep] = useState<SyncStep>('org-scan');

  // Org scan state
  const [orgName, setOrgName] = useState(settings?.organizationFilter ?? '');
  const [isScanning, setIsScanning] = useState(false);
  const [orgMembers, setOrgMembers] = useState<OrgMember[]>([]);
  const [availablePersons, setAvailablePersons] = useState<AvailablePerson[]>([]);
  const [scanError, setScanError] = useState<string | null>(null);
  const [mappings, setMappings] = useState<Record<string, string>>({}); // githubLogin -> personId
  const [isSavingMappings, setIsSavingMappings] = useState(false);

  // Sync config state
  const [syncRepositories, setSyncRepositories] = useState(settings?.syncRepositories ?? true);
  const [inferSkills, setInferSkills] = useState(settings?.inferSkills ?? true);
  const [syncContributions, setSyncContributions] = useState(settings?.syncContributions ?? true);
  const [progressMessages, setProgressMessages] = useState<string[]>([]);
  const [syncResult, setSyncResult] = useState<SyncResultData | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Org scan
  const handleScanOrg = async () => {
    if (!orgName.trim()) return;
    setIsScanning(true);
    setScanError(null);
    setOrgMembers([]);

    try {
      const response = await fetch(
        `/api/tenants/${tenantSlug}/admin/integrations/github/org-members?org=${encodeURIComponent(orgName.trim())}`,
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to scan organization');
      }

      setOrgMembers(data.members);
      setAvailablePersons(data.availablePersons);

      // Pre-populate mappings for already-matched members
      const initialMappings: Record<string, string> = {};
      for (const member of data.members) {
        if (member.matchedPersonId) {
          initialMappings[member.githubLogin] = member.matchedPersonId;
        }
      }
      setMappings(initialMappings);
    } catch (err) {
      setScanError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsScanning(false);
    }
  };

  // Save mappings (assign GitHub usernames to persons)
  const handleSaveMappings = async () => {
    const newMappings = Object.entries(mappings)
      .filter(([login]) => {
        const member = orgMembers.find((m) => m.githubLogin === login);
        // Only save mappings for currently unmatched members (new assignments)
        return member && member.matchStatus === 'unmatched';
      })
      .map(([login, personId]) => ({
        personId,
        githubUsername: login,
      }));

    if (newMappings.length === 0) {
      setStep('configure');
      return;
    }

    setIsSavingMappings(true);
    try {
      const response = await fetch(`/api/tenants/${tenantSlug}/admin/integrations/github/assign-usernames`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mappings: newMappings }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save mappings');
      }

      setStep('configure');
    } catch (err) {
      setScanError(err instanceof Error ? err.message : 'Failed to save mappings');
    } finally {
      setIsSavingMappings(false);
    }
  };

  // Sync
  const handleSync = async () => {
    setStep('syncing');
    setProgressMessages([]);
    setSyncResult(null);
    setSyncError(null);

    try {
      const response = await fetch(`/api/tenants/${tenantSlug}/admin/integrations/github/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ syncRepositories, inferSkills, syncContributions }),
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
            const data = JSON.parse(line) as {
              type: string;
              message?: string;
              result?: SyncResultData;
              error?: string;
            };
            if (data.type === 'progress' && data.message) {
              setProgressMessages((prev) => [...prev, data.message!]);
            } else if (data.type === 'complete' && data.result) {
              setSyncResult(data.result);
              setStep('complete');
            } else if (data.type === 'error') {
              setSyncError(data.error ?? t('sync.unknownError'));
              setStep('complete');
            }
          } catch {
            // Skip malformed lines
          }
        }
      }
    } catch (err) {
      setSyncError(err instanceof Error ? err.message : t('sync.unknownError'));
      setStep('complete');
    }
  };

  const matchedCount = orgMembers.filter((m) => m.matchStatus === 'matched').length;
  const newMappingsCount = Object.entries(mappings).filter(
    ([login]) => orgMembers.find((m) => m.githubLogin === login)?.matchStatus === 'unmatched',
  ).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitBranch className="h-5 w-5" />
          {t('sync.title')}
        </CardTitle>
        <CardDescription>{t('sync.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Step 1: Org Scan & Member Mapping */}
        {step === 'org-scan' && (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>{t('sync.orgScanLabel')}</Label>
              <p className="text-xs text-muted-foreground">{t('sync.orgScanDesc')}</p>
              <div className="flex gap-2">
                <Input
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder={t('sync.orgScanPlaceholder')}
                  className="flex-1"
                />
                <Button onClick={handleScanOrg} disabled={isScanning || !orgName.trim()} variant="secondary">
                  {isScanning ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
                  {t('sync.scanOrg')}
                </Button>
              </div>
            </div>

            {scanError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{scanError}</AlertDescription>
              </Alert>
            )}

            {orgMembers.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    {t('sync.orgMembersTitle', { count: orgMembers.length })}
                  </h4>
                  <div className="flex gap-2">
                    <Badge variant="default">
                      {matchedCount} {t('sync.matched')}
                    </Badge>
                    <Badge variant="outline">
                      {orgMembers.length - matchedCount} {t('sync.unmatched')}
                    </Badge>
                    {newMappingsCount > 0 && (
                      <Badge variant="secondary">
                        {newMappingsCount} {t('sync.newMappings')}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="max-h-80 overflow-y-auto space-y-2 border rounded-md p-2">
                  {orgMembers.map((member) => (
                    <div key={member.githubLogin} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={member.avatarUrl} alt={member.githubLogin} className="h-8 w-8 rounded-full" />
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-mono">@{member.githubLogin}</span>
                        {member.matchStatus === 'matched' && (
                          <span className="ml-2 text-xs text-green-600">→ {member.matchedPersonName}</span>
                        )}
                      </div>
                      {member.matchStatus === 'unmatched' ? (
                        <select
                          className="text-xs border rounded px-2 py-1 bg-background max-w-48"
                          value={mappings[member.githubLogin] ?? ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setMappings((prev) => {
                              if (!val) {
                                const next = { ...prev };
                                delete next[member.githubLogin];
                                return next;
                              }
                              return { ...prev, [member.githubLogin]: val };
                            });
                          }}
                        >
                          <option value="">{t('sync.selectPerson')}</option>
                          {availablePersons
                            .filter((p) => !p.githubUsername)
                            .map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name} ({p.email})
                              </option>
                            ))}
                        </select>
                      ) : (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          {t('sync.linked')}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex justify-between pt-2">
                  <Button variant="ghost" onClick={() => setStep('configure')}>
                    {t('sync.skipMapping')}
                  </Button>
                  <Button onClick={handleSaveMappings} disabled={isSavingMappings}>
                    {isSavingMappings && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {newMappingsCount > 0
                      ? t('sync.saveMappingsAndContinue', { count: newMappingsCount })
                      : t('sync.continueToSync')}
                  </Button>
                </div>
              </div>
            )}

            {/* Skip org scan and go directly to sync */}
            {orgMembers.length === 0 && !isScanning && (
              <div className="pt-2 border-t">
                <Button variant="ghost" onClick={() => setStep('configure')}>
                  {t('sync.skipOrgScan')}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Configure */}
        {step === 'configure' && (
          <div className="space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">{t('sync.syncRepositories')}</Label>
                <p className="text-xs text-muted-foreground">{t('sync.syncRepositoriesDesc')}</p>
              </div>
              <Switch checked={syncRepositories} onCheckedChange={setSyncRepositories} />
            </div>

            <div className="flex items-start justify-between gap-4">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">{t('sync.inferSkills')}</Label>
                <p className="text-xs text-muted-foreground">{t('sync.inferSkillsDesc')}</p>
              </div>
              <Switch checked={inferSkills} onCheckedChange={setInferSkills} />
            </div>

            <div className="flex items-start justify-between gap-4">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">{t('sync.syncContributions')}</Label>
                <p className="text-xs text-muted-foreground">{t('sync.syncContributionsDesc')}</p>
              </div>
              <Switch checked={syncContributions} onCheckedChange={setSyncContributions} />
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep('org-scan')}>
                {t('sync.backToMapping')}
              </Button>
              <Button onClick={handleSync} className="flex-1">
                <Play className="h-4 w-4 mr-2" />
                {t('sync.startSync')}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Syncing */}
        {step === 'syncing' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t('sync.syncing')}
            </div>
            <div className="max-h-60 overflow-y-auto space-y-1 rounded-md bg-muted p-3 text-xs font-mono">
              {progressMessages.map((msg, i) => (
                <div key={i} className="text-muted-foreground">
                  {msg}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Complete */}
        {step === 'complete' && (
          <div className="space-y-4">
            {syncError ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{t('sync.errorTitle')}</AlertTitle>
                <AlertDescription>{syncError}</AlertDescription>
              </Alert>
            ) : syncResult ? (
              <>
                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertTitle>{t('sync.completeTitle')}</AlertTitle>
                  <AlertDescription>
                    <div className="mt-2 space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <GitBranch className="h-3 w-3" />
                        {t('sync.personsProcessed', { count: syncResult.totalPersonsProcessed })}
                      </div>
                      <div className="flex items-center gap-2">
                        <GitPullRequest className="h-3 w-3" />
                        {t('sync.reposScanned', { count: syncResult.totalReposScanned })}
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>

                {syncResult.results.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">{t('sync.detailedResults')}</h4>
                    <div className="max-h-60 overflow-y-auto space-y-2">
                      {syncResult.results.map((r) => (
                        <div
                          key={r.personUsername}
                          className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                        >
                          <span className="font-mono">@{r.personUsername}</span>
                          <span className="text-muted-foreground"></span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {syncResult.errors.length > 0 && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>{t('sync.errorsTitle')}</AlertTitle>
                    <AlertDescription>
                      <ul className="mt-1 list-disc list-inside text-xs">
                        {syncResult.errors.map((e, i) => (
                          <li key={i}>{e}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
              </>
            ) : null}

            <Button
              variant="outline"
              onClick={() => {
                setStep('org-scan');
                setProgressMessages([]);
                setSyncResult(null);
                setSyncError(null);
              }}
            >
              {t('sync.syncAgain')}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
