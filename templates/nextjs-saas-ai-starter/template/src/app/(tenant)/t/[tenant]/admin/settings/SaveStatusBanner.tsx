'use client';

import type { SaveStatus } from '@/features/admin/components/settings';

interface SaveStatusBannerProps {
  status: SaveStatus;
}

export function SaveStatusBanner({ status }: SaveStatusBannerProps) {
  if (status === 'idle') {
    return null;
  }

  return (
    <div
      className={`px-4 py-2 rounded-md text-sm ${
        status === 'saving'
          ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
          : status === 'saved'
            ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300'
            : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300'
      }`}
    >
      {status === 'saving' && 'Saving...'}
      {status === 'saved' && 'Settings saved successfully!'}
      {status === 'error' && 'Failed to save settings. Please try again.'}
    </div>
  );
}
