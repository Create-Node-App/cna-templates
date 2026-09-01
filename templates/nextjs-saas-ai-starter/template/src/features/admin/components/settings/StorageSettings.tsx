'use client';

import { CheckCircle, Eye, EyeOff, Loader2, XCircle } from 'lucide-react';
import { useState } from 'react';

import {
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
import { storageProviders } from '@/shared/lib/tenant-settings';

import { useSettings } from './SettingsProvider';

export function StorageSettings() {
  const { storage, settings, setSettings, isPending, handleSave } = useSettings();

  const [showSecretKey, setShowSecretKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);

  const handleStorageUpdate = (key: keyof NonNullable<typeof settings.storage>, value: unknown) => {
    const newStorage = { ...storage, [key]: value };
    setSettings({ ...settings, storage: newStorage });
    setTestResult(null);
  };

  const testConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      if (
        !settings.storage?.provider ||
        !settings.storage?.accessKey ||
        !settings.storage?.secretKey ||
        !settings.storage?.bucket
      ) {
        setTestResult('error');
      } else {
        setTestResult('success');
      }
    } catch {
      setTestResult('error');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Storage Provider Configuration</CardTitle>
          <CardDescription>Configure your S3-compatible storage for file uploads.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="storage-provider">Storage Provider</Label>
            <p className="text-xs text-muted-foreground mb-2">Select your storage provider</p>
            <select
              id="storage-provider"
              value={storage.provider || ''}
              onChange={(e) => handleStorageUpdate('provider', e.target.value || undefined)}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Select provider...</option>
              {storageProviders.map((p) => (
                <option key={p} value={p}>
                  {p === 's3' ? 'AWS S3' : p === 'minio' ? 'MinIO' : 'Cloudflare R2'}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="storage-endpoint">Endpoint URL</Label>
            <p className="text-xs text-muted-foreground mb-2">S3-compatible endpoint</p>
            <Input
              id="storage-endpoint"
              value={settings.storage?.endpoint || ''}
              onChange={(e) => handleStorageUpdate('endpoint', e.target.value || undefined)}
              placeholder="http://minio:9000"
            />
          </div>
          <div>
            <Label htmlFor="storage-public-endpoint">Public Endpoint</Label>
            <p className="text-xs text-muted-foreground mb-2">Browser-accessible endpoint</p>
            <Input
              id="storage-public-endpoint"
              value={settings.storage?.publicEndpoint || ''}
              onChange={(e) => handleStorageUpdate('publicEndpoint', e.target.value || undefined)}
              placeholder="http://localhost:9000"
            />
          </div>
          <div>
            <Label htmlFor="storage-bucket">Bucket Name</Label>
            <Input
              id="storage-bucket"
              value={settings.storage?.bucket || ''}
              onChange={(e) => handleStorageUpdate('bucket', e.target.value || undefined)}
              placeholder="saas-template-uploads"
            />
          </div>
          <div>
            <Label htmlFor="storage-region">Region</Label>
            <Input
              id="storage-region"
              value={storage.region || ''}
              onChange={(e) => handleStorageUpdate('region', e.target.value)}
              placeholder="us-east-1"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Storage Credentials</CardTitle>
          <CardDescription>Access credentials for your storage provider</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="storage-access-key">Access Key</Label>
            <Input
              id="storage-access-key"
              value={settings.storage?.accessKey || ''}
              onChange={(e) => handleStorageUpdate('accessKey', e.target.value || undefined)}
              placeholder="AKIAIOSFODNN7EXAMPLE"
            />
          </div>
          <div>
            <Label htmlFor="storage-secret-key">Secret Key</Label>
            <div className="relative">
              <Input
                id="storage-secret-key"
                type={showSecretKey ? 'text' : 'password'}
                value={settings.storage?.secretKey || ''}
                onChange={(e) => handleStorageUpdate('secretKey', e.target.value || undefined)}
                className="pr-10"
                placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
              />
              <button
                type="button"
                onClick={() => setShowSecretKey(!showSecretKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showSecretKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between pt-2">
            <div>
              <Label>Force Path Style</Label>
              <p className="text-xs text-muted-foreground">Required for MinIO</p>
            </div>
            <Switch
              checked={storage.forcePathStyle !== false}
              onCheckedChange={(checked) => handleStorageUpdate('forcePathStyle', checked)}
              disabled={isPending}
            />
          </div>
          <div className="flex items-center gap-2 pt-4">
            <Button
              variant="outline"
              onClick={testConnection}
              disabled={
                testing ||
                !settings.storage?.provider ||
                !settings.storage?.accessKey ||
                !settings.storage?.secretKey ||
                !settings.storage?.bucket
              }
            >
              {testing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Test Connection
            </Button>
            {testResult === 'success' && (
              <span className="flex items-center text-green-600 text-sm">
                <CheckCircle className="h-4 w-4 mr-1" /> Connected
              </span>
            )}
            {testResult === 'error' && (
              <span className="flex items-center text-red-600 text-sm">
                <XCircle className="h-4 w-4 mr-1" /> Connection failed
              </span>
            )}
          </div>
          <Button onClick={() => handleSave('storage', { storage })} disabled={isPending}>
            Save Storage Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
