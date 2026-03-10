import { getAllDocContents } from './docs-content';
import { findSectionForSlug } from './docs-navigation';

export interface SearchIndexItem {
  slug: string;
  title: string;
  description: string;
  section: string;
  sectionId: string;
  content: string;
}

/**
 * Build a flat search index from all doc content for a given locale.
 * This runs on the server side and the result is passed to the client.
 */
export function buildSearchIndex(locale: string = 'en'): SearchIndexItem[] {
  const docs = getAllDocContents(locale);
  return docs.map((doc) => {
    const section = findSectionForSlug(doc.slug);
    return {
      slug: doc.slug,
      title: doc.frontmatter.title,
      description: doc.frontmatter.description ?? '',
      section: section?.titleKey ?? '',
      sectionId: section?.id ?? '',
      // Strip markdown syntax for search
      content: doc.content
        .replace(/^#{1,6}\s+/gm, '')
        .replace(/\*\*/g, '')
        .replace(/\*/g, '')
        .replace(/`{1,3}[^`]*`{1,3}/g, '')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
        .replace(/^>\s+/gm, '')
        .replace(/^[-*+]\s+/gm, '')
        .replace(/^\d+\.\s+/gm, '')
        .replace(/---/g, '')
        .replace(/\n{2,}/g, '\n')
        .trim()
        .slice(0, 2000), // Limit content size for search
    };
  });
}
