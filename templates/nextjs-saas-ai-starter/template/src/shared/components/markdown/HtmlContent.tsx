'use client';

import DOMPurify from 'dompurify';

export interface HtmlContentProps {
  /** Raw HTML string; will be sanitized before render */
  html: string;
  /** Optional class name for the wrapper */
  className?: string;
}

const ALLOWED_TAGS = [
  'p',
  'br',
  'strong',
  'b',
  'em',
  'i',
  'u',
  's',
  'a',
  'ul',
  'ol',
  'li',
  'h1',
  'h2',
  'h3',
  'h4',
  'blockquote',
  'code',
  'pre',
  'img',
  'span',
  'div',
];
const ALLOWED_ATTR = ['href', 'title', 'target', 'rel', 'src', 'alt', 'width', 'height', 'class'];

/** Strip tags for SSR / non-DOM env (plain text fallback) */
function stripTags(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Renders sanitized HTML (e.g. from TipTap). Use for rich text content
 * and dimension notes when content is stored as HTML.
 * Sanitization runs only in the browser; on server renders plain-text fallback.
 */
export function HtmlContent({ html, className }: HtmlContentProps) {
  if (!html?.trim()) return null;

  const isClient = typeof window !== 'undefined';
  const sanitized = isClient
    ? DOMPurify.sanitize(html, { ALLOWED_TAGS, ALLOWED_ATTR, ADD_ATTR: ['target', 'rel'] })
    : stripTags(html);

  if (!isClient) {
    return <div className={className}>{sanitized}</div>;
  }

  return <div className={className} dangerouslySetInnerHTML={{ __html: sanitized }} />;
}
