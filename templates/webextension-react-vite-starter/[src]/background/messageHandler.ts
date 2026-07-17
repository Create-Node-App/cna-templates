import Browser from 'webextension-polyfill';

import { getSettings } from '@/shared/settings';
import type { ExtensionMessage, ExtensionResponse } from '@/shared/messages';
import { isExtensionMessage } from '@/shared/messages';

async function handleMessage(message: ExtensionMessage): Promise<ExtensionResponse> {
  switch (message.type) {
    case 'PING':
      return {
        type: 'PONG',
        timestamp: Date.now(),
        settings: await getSettings(),
      };
    default:
      return {
        type: 'ERROR',
        message: 'Unsupported message type',
      };
  }
}

export function registerMessageListener(): void {
  Browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (!isExtensionMessage(message)) {
      sendResponse({
        type: 'ERROR',
        message: 'Invalid message payload',
      } satisfies ExtensionResponse);
      return true;
    }

    void handleMessage(message).then(sendResponse);
    return true;
  });
}
