import type { Preview } from '@storybook/react';
import { NextIntlClientProvider } from 'next-intl';
import React from 'react';
import { ThemeProvider } from '@/shared/components/providers/theme-provider';
import { TenantProvider } from '@/shared/providers/tenant-provider';
import { mockMessages } from './mock-messages';
import '../src/app/globals.css';

const mockTenant = { slug: 'demo', id: 'tenant-demo', name: 'Demo Tenant' };

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: 'centered',
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: 'hsl(var(--background))' },
        { name: 'dark', value: 'hsl(var(--foreground))' },
      ],
    },
  },
  decorators: [
    (Story) =>
      React.createElement(
        ThemeProvider,
        { attribute: 'class', defaultTheme: 'light', enableSystem: false },
        React.createElement(
          NextIntlClientProvider,
          { locale: 'en', messages: mockMessages },
          React.createElement(
            TenantProvider,
            { value: mockTenant },
            React.createElement('div', { className: 'min-h-[200px] p-4' }, React.createElement(Story)),
          ),
        ),
      ),
  ],
};

export default preview;
