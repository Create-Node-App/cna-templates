'use client';

import { CheckCircle, ExternalLink, Eye, EyeOff, Loader2, XCircle } from 'lucide-react';
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
} from '@/shared/components/ui';

import { saveGitHubCredentials } from '../services/github-credentials-service';

interface GitHubCredentialsFormProps {
  tenantSlug: string;
  initialClientId?: string;
  initialClientSecret?: string;
  hasEnvCredentials: boolean;
}

export function GitHubCredentialsForm({
  tenantSlug,
  initialClientId = '',
  initialClientSecret = '',
  hasEnvCredentials,
}: GitHubCredentialsFormProps) {
  const t = useTranslations('admin.github');
  const router = useRouter();

  const [clientId, setClientId] = useState(initialClientId);
  const [clientSecret, setClientSecret] = useState(initialClientSecret);
  const [showSecret, setShowSecret] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const [testError, setTestError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isSaving, setIsSaving] = useState(false);

  const handleTest = () => {
    if (!clientId || !clientSecret) return;

    setTestResult(null);
    setTestError(null);

    startTransition(async () => {
      if (clientId.trim().length < 5) {
        setTestResult('error');
        setTestError(t('credentials.clientIdTooShort'));
        return;
      }
      if (clientSecret.trim().length < 5) {
        setTestResult('error');
        setTestError(t('credentials.clientSecretTooShort'));
        return;
      }
      setTestResult('success');
    });
  };

  const handleSave = async () => {
    if (!clientId || !clientSecret) return;

    setIsSaving(true);
    try {
      const result = await saveGitHubCredentials(tenantSlug, clientId, clientSecret);
      if (result.success) {
        router.refresh();
      } else {
        setTestError(result.error ?? t('credentials.saveFailed'));
      }
    } catch {
      setTestError(t('credentials.saveFailed'));
    } finally {
      setIsSaving(false);
    }
  };

  const isConfigured = !!(clientId && clientSecret);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('credentials.title')}</CardTitle>
        <CardDescription>{t('credentials.description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {hasEnvCredentials && (
          <Alert>
            <AlertTitle>{t('credentials.envConfigured')}</AlertTitle>
            <AlertDescription>{t('credentials.envConfiguredDesc')}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div>
            <Label htmlFor="gh-client-id">{t('credentials.clientId')}</Label>
            <p className="text-xs text-muted-foreground mb-2">{t('credentials.clientIdHint')}</p>
            <Input
              id="gh-client-id"
              value={clientId}
              onChange={(e) => {
                setClientId(e.target.value);
                setTestResult(null);
              }}
              placeholder="Iv1.abc123..."
            />
          </div>

          <div>
            <Label htmlFor="gh-client-secret">{t('credentials.clientSecret')}</Label>
            <p className="text-xs text-muted-foreground mb-2">{t('credentials.clientSecretHint')}</p>
            <div className="relative">
              <Input
                id="gh-client-secret"
                type={showSecret ? 'text' : 'password'}
                value={clientSecret}
                onChange={(e) => {
                  setClientSecret(e.target.value);
                  setTestResult(null);
                }}
                className="pr-10"
                placeholder="your-client-secret"
              />
              <button
                type="button"
                onClick={() => setShowSecret(!showSecret)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" onClick={handleTest} disabled={isPending || !clientId || !clientSecret}>
              {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {t('credentials.testCredentials')}
            </Button>

            {testResult === 'success' && (
              <span className="flex items-center text-green-600 text-sm">
                <CheckCircle className="h-4 w-4 mr-1" /> {t('credentials.testSuccess')}
              </span>
            )}
            {testResult === 'error' && (
              <span className="flex items-center text-red-600 text-sm">
                <XCircle className="h-4 w-4 mr-1" /> {testError || t('credentials.testFailed')}
              </span>
            )}
          </div>

          <div className="pt-4 border-t flex items-center justify-between">
            <a
              href="https://github.com/settings/developers"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              {t('credentials.githubDevSettings')}
              <ExternalLink className="h-3 w-3" />
            </a>

            <Button onClick={handleSave} disabled={isSaving || !isConfigured}>
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {t('credentials.saveCredentials')}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
