import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getLocale } from 'next-intl/server';

import { DocsBreadcrumb } from '@/features/docs/components/DocsBreadcrumb';
import { DocsContent } from '@/features/docs/components/DocsContent';
import { DocsPagination } from '@/features/docs/components/DocsPagination';
import { DocsTableOfContents } from '@/features/docs/components/DocsTableOfContents';
import { getDocContent } from '@/features/docs/lib/docs-content';
import { getPrevNextPages } from '@/features/docs/lib/docs-navigation';

interface DocsPageProps {
  params: Promise<{ slug: string[] }>;
}

export async function generateMetadata({ params }: DocsPageProps): Promise<Metadata> {
  const { slug: slugParts } = await params;
  const slug = slugParts.join('/');
  const locale = await getLocale();
  const doc = getDocContent(locale, slug);

  if (!doc) return { title: 'Not Found | Next.js SaaS AI Template Docs' };

  return {
    title: `${doc.frontmatter.title} | Next.js SaaS AI Template Docs`,
    description: doc.frontmatter.description ?? `Next.js SaaS AI Template documentation — ${doc.frontmatter.title}`,
    openGraph: {
      title: `${doc.frontmatter.title} | Next.js SaaS AI Template Docs`,
      description: doc.frontmatter.description ?? `Next.js SaaS AI Template documentation — ${doc.frontmatter.title}`,
      type: 'article',
    },
  };
}

export default async function DocsPage({ params }: DocsPageProps) {
  const { slug: slugParts } = await params;
  const slug = slugParts.join('/');
  const locale = await getLocale();

  const doc = getDocContent(locale, slug);
  if (!doc) notFound();

  const { prev, next } = getPrevNextPages(slug);

  return (
    <div className="flex gap-8">
      {/* Main content */}
      <article className="min-w-0 flex-1">
        <DocsBreadcrumb slug={slug} />

        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{doc.frontmatter.title}</h1>
          {doc.frontmatter.description && (
            <p className="mt-2 text-lg text-muted-foreground">{doc.frontmatter.description}</p>
          )}
        </div>

        <DocsContent content={doc.content} />
        <DocsPagination prev={prev} next={next} />
      </article>

      {/* Table of contents — hidden on mobile/tablet */}
      <aside className="hidden xl:block w-56 shrink-0">
        <DocsTableOfContents content={doc.content} />
      </aside>
    </div>
  );
}
