'use client';

import { AlertTriangle } from 'lucide-react';

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from '@/shared/components/ui';

import { useSettings } from './SettingsProvider';

/**
 * General Settings Component
 *
 * Organization details and danger zone settings.
 */
export function GeneralSettings() {
  const { tenantSlug, name, description, setName, setDescription, isPending, handleSave } = useSettings();

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Organization Details</CardTitle>
          <CardDescription>Basic tenant configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="tenant-slug">Tenant Slug</Label>
            <Input id="tenant-slug" value={tenantSlug} disabled className="mt-1 font-mono bg-muted" />
          </div>
          <div>
            <Label htmlFor="tenant-name">Display Name</Label>
            <Input
              id="tenant-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1"
              placeholder="Organization Name"
            />
          </div>
          <div>
            <Label htmlFor="tenant-description">Description</Label>
            <textarea
              id="tenant-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              rows={3}
              placeholder="Brief description of the organization"
            />
          </div>
          <Button onClick={() => handleSave('info', { name, description })} disabled={isPending}>
            Save Changes
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Danger Zone
          </CardTitle>
          <CardDescription>Irreversible actions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
            <h4 className="font-medium text-red-800 dark:text-red-200">Reset Settings</h4>
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              Reset all settings to default values. This cannot be undone.
            </p>
            <Button
              variant="destructive"
              size="sm"
              className="mt-3"
              onClick={() => {
                if (confirm('Are you sure you want to reset all settings?')) {
                  handleSave('reset', {});
                }
              }}
              disabled={isPending}
            >
              Reset Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
