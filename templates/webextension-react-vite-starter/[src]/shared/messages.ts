import Browser from 'webextension-polyfill';

import type { ExtensionSettings } from '@/shared/settings';

export type PingMessage = {
  type: 'PING';
};

export type PingResponse = {
  type: 'PONG';
  timestamp: number;
  settings: ExtensionSettings;
};

export type ErrorResponse = {
  type: 'ERROR';
  message: string;
};

export type ExtensionMessage = PingMessage;
export type ExtensionResponse = PingResponse | ErrorResponse;

export function isExtensionMessage(message: unknown): message is ExtensionMessage {
  return typeof message === 'object' && message !== null && 'type' in message && (message as PingMessage).type === 'PING';
}

export async function sendExtensionMessage<T extends ExtensionResponse>(message: ExtensionMessage): Promise<T> {
  const response = await Browser.runtime.sendMessage(message);
  return response as T;
}
