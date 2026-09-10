import { render, screen, waitFor } from '@testing-library/react';
import Browser from 'webextension-polyfill';

import Options from '@/options/Options';
import { DEFAULT_SETTINGS, SETTINGS_STORAGE_KEY } from '@/shared/settings';

import '@testing-library/jest-dom';

describe('Options', () => {
  it('loads saved settings from storage.sync', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- webextension-polyfill ships no mock-friendly types, and this suite runs under Jest (npm test), where vitest helpers cannot be imported.
    (Browser.storage.sync.get as any).mockResolvedValue({
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
