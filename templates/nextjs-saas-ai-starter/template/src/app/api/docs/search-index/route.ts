import { NextResponse } from 'next/server';
import { getLocale } from 'next-intl/server';

import { buildSearchIndex } from '@/features/docs/lib/docs-search-index';

export async function GET() {
  const locale = await getLocale();
  const index = buildSearchIndex(locale);
  return NextResponse.json(index, {
    headers: {
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  });
}
