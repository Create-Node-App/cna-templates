import { useState } from 'react';
import { sendExtensionMessage, type PingResponse } from '@/shared/messages';

export type PingUiStatus = 'idle' | 'loading' | 'success' | 'error';

export function usePingBackground() {
  const [pingStatus, setPingStatus] = useState<PingUiStatus>('idle');
  const [pingMessage, setPingMessage] = useState('');

  const pingBackground = async () => {
    setPingStatus('loading');
    setPingMessage('');

    try {
      const response = await sendExtensionMessage<PingResponse>({ type: 'PING' });
      if (!response || response.type !== 'PONG') {
        throw new Error('Unexpected background response');
      }
      const greeting = response.settings.displayName.trim() || 'there';
      const when = new Date(response.timestamp).toLocaleTimeString();
      setPingStatus('success');
      setPingMessage(
        'Background replied at ' + when + ' — hello, ' + greeting + '!',
      );
    } catch (error) {
      setPingStatus('error');
      setPingMessage(error instanceof Error ? error.message : 'Background did not respond');
    }
  };

  return { pingStatus, pingMessage, pingBackground };
}
