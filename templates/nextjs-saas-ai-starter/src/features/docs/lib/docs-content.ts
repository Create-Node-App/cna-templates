import matter from 'gray-matter';
import fs from 'fs';
import path from 'path';

import type { DocContent, DocFrontmatter } from '../types';

const CONTENT_DIR = path.join(process.cwd(), 'src/features/docs/content');

/**
 * Load a documentation page by locale and slug.
 * Returns null if the page doesn't exist.
 */
export function getDocContent(locale: string, slug: string): DocContent | null {
  // Try the exact path first
  const filePath = path.join(CONTENT_DIR, locale, `${slug}.md`);

  // Also try index.md for section root pages
  const indexPath = path.join(CONTENT_DIR, locale, slug, 'index.md');

  let resolvedPath: string | null = null;
  if (fs.existsSync(filePath)) {
    resolvedPath = filePath;
  } else if (fs.existsSync(indexPath)) {
    resolvedPath = indexPath;
  }

  if (!resolvedPath) {
    // Fall back to English if locale content doesn't exist
    if (locale !== 'en') {
      return getDocContent('en', slug);
    }
    return null;
  }

  const raw = fs.readFileSync(resolvedPath, 'utf-8');
  const { data, content } = matter(raw);

  return {
    frontmatter: data as DocFrontmatter,
    content,
    slug,
  };
}

/**
 * Get all available doc slugs for a locale.
 */
export function getAllDocSlugs(locale: string = 'en'): string[] {
  const slugs: string[] = [];
  const baseDir = path.join(CONTENT_DIR, locale);

  if (!fs.existsSync(baseDir)) return slugs;

  function walk(dir: string, prefix: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        walk(path.join(dir, entry.name), prefix ? `${prefix}/${entry.name}` : entry.name);
      } else if (entry.name.endsWith('.md')) {
        const name = entry.name.replace('.md', '');
        if (name === 'index') {
          slugs.push(prefix);
        } else {
          slugs.push(prefix ? `${prefix}/${name}` : name);
        }
      }
    }
  }

  walk(baseDir, '');
  return slugs;
}

/**
 * Get all doc content for building search index.
 */
export function getAllDocContents(locale: string = 'en'): DocContent[] {
  const slugs = getAllDocSlugs(locale);
  const contents: DocContent[] = [];
  for (const slug of slugs) {
    const doc = getDocContent(locale, slug);
    if (doc) contents.push(doc);
  }
  return contents;
}
