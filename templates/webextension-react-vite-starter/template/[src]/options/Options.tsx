import React, { useEffect, useState } from 'react';

import { DEFAULT_SETTINGS, getSettings, saveSettings, type ExtensionSettings } from '@/shared/settings';
import '@/options/Options.css';

const Options: React.FC = () => {
  const [settings, setSettings] = useState<ExtensionSettings>(DEFAULT_SETTINGS);
  const [status, setStatus] = useState<'idle' | 'loading' | 'saving' | 'saved' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const storedSettings = await getSettings();
        if (!cancelled) {
          setSettings(storedSettings);
          setStatus('idle');
        }
      } catch (error) {
        if (!cancelled) {
          setStatus('error');
          setErrorMessage(error instanceof Error ? error.message : 'Failed to load settings');
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('saving');
    setErrorMessage('');

    try {
      await saveSettings(settings);
      setStatus('saved');
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to save settings');
    }
  };

  return (
    <div className="options">
      <header className="options__header">
        <p className="options__eyebrow">Extension settings</p>
        <h1 className="options__title">Options</h1>
        <p className="options__lead">Preferences are stored with <code>browser.storage.sync</code> via webextension-polyfill.</p>
      </header>

      {status === 'loading' ? (
        <p className="options__status">Loading settings…</p>
      ) : (
        <form className="options__form" onSubmit={handleSubmit}>
          <label className="options__field">
            <span>Display name</span>
            <input
              type="text"
              value={settings.displayName}
              aria-label="Display name"
              placeholder="How should the extension greet you?"
              onChange={(event) => setSettings((current) => ({ ...current, displayName: event.target.value }))}
            />
          </label>

          <label className="options__checkbox">
            <input
              type="checkbox"
              checked={settings.enableNotifications}
              aria-label="Enable notifications"
              onChange={(event) =>
                setSettings((current) => ({ ...current, enableNotifications: event.target.checked }))
              }
            />
            <span>Enable notifications</span>
          </label>

          <div className="options__actions">
            <button type="submit" className="options__button" disabled={status === 'saving'}>
              {status === 'saving' ? 'Saving…' : 'Save settings'}
            </button>
            {status === 'saved' ? <p className="options__status options__status--success">Settings saved.</p> : null}
            {status === 'error' ? <p className="options__status options__status--error">{errorMessage}</p> : null}
          </div>
        </form>
      )}
    </div>
  );
};

export default Options;
