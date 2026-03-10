import type { Metadata } from 'next';

import { DocsLayoutClient } from '@/features/docs/components/DocsLayoutClient';

export const metadata: Metadata = {
  title: 'Documentation | Next.js SaaS AI Template',
  description: 'Complete documentation for the Next.js SaaS AI Template — guides for members and administrators.',
};

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return <DocsLayoutClient>{children}</DocsLayoutClient>;
}
