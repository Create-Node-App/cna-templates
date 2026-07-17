import Browser from 'webextension-polyfill';

export const SETTINGS_STORAGE_KEY = 'extensionSettings';

export interface ExtensionSettings {
  enableNotifications: boolean;
  displayName: string;
}

export const DEFAULT_SETTINGS: ExtensionSettings = {
  enableNotifications: true,
  displayName: '',
};

export async function getSettings(): Promise<ExtensionSettings> {
  const stored = await Browser.storage.sync.get(SETTINGS_STORAGE_KEY);
  const value = stored[SETTINGS_STORAGE_KEY] as Partial<ExtensionSettings> | undefined;

  return {
    ...DEFAULT_SETTINGS,
    ...value,
  };
}

export async function saveSettings(settings: ExtensionSettings): Promise<void> {
  await Browser.storage.sync.set({ [SETTINGS_STORAGE_KEY]: settings });
}
