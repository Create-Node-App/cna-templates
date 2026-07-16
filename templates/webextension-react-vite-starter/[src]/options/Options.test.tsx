import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Browser from 'webextension-polyfill';

import Options from '@/options/Options';
import { DEFAULT_SETTINGS, SETTINGS_STORAGE_KEY } from '@/shared/settings';

describe('Options', () => {
  it('loads saved settings from storage.sync', async () => {
    vi.mocked(Browser.storage.sync.get).mockResolvedValue({
      [SETTINGS_STORAGE_KEY]: {
        ...DEFAULT_SETTINGS,
        displayName: 'Test User',
        enableNotifications: false,
      },
    });

    render(<Options />);

    await waitFor(() => {
      expect(screen.getByLabelText(/display name/i)).toHaveValue('Test User');
    });

    expect(screen.getByLabelText(/enable notifications/i)).not.toBeChecked();
  });
});
