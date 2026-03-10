'use client';

/**
 * ChatMessageRenderer Component
 *
 * Renders AI chat messages with rich GenUI components based on detected patterns.
 * Falls back to markdown rendering for non-structured content.
 */

import { useMemo } from 'react';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { cn } from '@/shared/lib/utils';

import { ComparisonTableCard } from './ComparisonTableCard';
import { PersonMiniCard } from './PersonMiniCard';
import { detectAllPatterns, type DetectedPattern } from '../utils/pattern-detectors';

interface ChatMessageRendererProps {
  content: string;
  className?: string;
  isUserMessage?: boolean;
  /** When set, GenUI components get links. */
  tenantSlug?: string;
}

/**
 * Renders a detected pattern as a GenUI component.
 * Fallback patterns don't have IDs (personId, capabilityId); tenantSlug still enables links where supported.
 */
function PatternRenderer({ pattern, tenantSlug }: { pattern: DetectedPattern; tenantSlug?: string }) {
  switch (pattern.type) {
    case 'person':
      return <PersonMiniCard person={pattern.data} className="my-2" tenantSlug={tenantSlug} />;
    case 'comparison':
      return <ComparisonTableCard comparison={pattern.data} className="my-3" tenantSlug={tenantSlug} />;
    default:
      return null;
  }
}

/**
 * Custom components for markdown rendering
 * Note: We destructure and ignore 'node' prop to avoid passing it to DOM elements
 */
const markdownComponents = {
  // Headings
  h1: ({ children }: { children?: React.ReactNode }) => <h1 className="text-lg font-bold mt-4 mb-2">{children}</h1>,
  h2: ({ children }: { children?: React.ReactNode }) => <h2 className="text-base font-bold mt-3 mb-2">{children}</h2>,
  h3: ({ children }: { children?: React.ReactNode }) => (
    <h3 className="text-sm font-bold mt-2 mb-1 text-primary">{children}</h3>
  ),

  // Paragraphs
  p: ({ children }: { children?: React.ReactNode }) => <p className="text-sm mb-2 last:mb-0">{children}</p>,

  // Lists
  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul className="text-sm list-disc list-inside space-y-1 my-2">{children}</ul>
  ),
  ol: ({ children }: { children?: React.ReactNode }) => (
    <ol className="text-sm list-decimal list-inside space-y-1 my-2">{children}</ol>
  ),
  li: ({ children }: { children?: React.ReactNode }) => <li className="text-sm">{children}</li>,

  // Code
  code: ({ children, className }: { children?: React.ReactNode; className?: string }) => {
    const isInline = !className?.includes('language-');
    if (isInline) {
      return <code className="px-1.5 py-0.5 rounded bg-muted text-xs font-mono text-primary">{children}</code>;
    }
    return <code className={cn('text-xs', className)}>{children}</code>;
  },
  pre: ({ children }: { children?: React.ReactNode }) => (
    <pre className="p-3 rounded-lg bg-muted overflow-x-auto text-xs my-2">{children}</pre>
  ),

  // Tables (enhanced styling)
  table: ({ children }: { children?: React.ReactNode }) => (
    <div className="my-3 rounded-lg border overflow-hidden">
      <table className="w-full text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }: { children?: React.ReactNode }) => <thead className="bg-muted/50">{children}</thead>,
  tbody: ({ children }: { children?: React.ReactNode }) => <tbody className="divide-y">{children}</tbody>,
  tr: ({ children }: { children?: React.ReactNode }) => (
    <tr className="hover:bg-muted/30 transition-colors">{children}</tr>
  ),
  th: ({ children }: { children?: React.ReactNode }) => (
    <th className="px-3 py-2 text-left font-semibold text-xs">{children}</th>
  ),
  td: ({ children }: { children?: React.ReactNode }) => <td className="px-3 py-2 text-xs">{children}</td>,

  // Links
  a: ({ children, href }: { children?: React.ReactNode; href?: string }) => (
    <a
      href={href}
      className="text-primary hover:underline"
      target={href?.startsWith('http') ? '_blank' : undefined}
      rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
    >
      {children}
    </a>
  ),

  // Blockquotes
  blockquote: ({ children }: { children?: React.ReactNode }) => (
    <blockquote className="border-l-2 border-primary/50 pl-3 my-2 text-sm italic text-muted-foreground">
      {children}
    </blockquote>
  ),

  // Horizontal rule
  hr: () => <hr className="my-3 border-muted" />,
};

export function ChatMessageRenderer({ content, className, isUserMessage, tenantSlug }: ChatMessageRendererProps) {
  // Detect GenUI patterns in the content
  const patterns = useMemo(() => detectAllPatterns(content), [content]);

  // If no patterns detected or user message, use simple markdown
  if (patterns.length === 0 || isUserMessage) {
    return (
      <div className={cn('text-sm', className)}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      </div>
    );
  }

  // Build segments: text between patterns + pattern components
  const segments: Array<{ type: 'text' | 'pattern'; content?: string; pattern?: DetectedPattern }> = [];
  let lastIndex = 0;

  for (const pattern of patterns) {
    // Add text before pattern
    if (pattern.startIndex > lastIndex) {
      const textBefore = content.slice(lastIndex, pattern.startIndex);
      if (textBefore.trim()) {
        segments.push({ type: 'text', content: textBefore });
      }
    }

    // Add pattern
    segments.push({ type: 'pattern', pattern });
    lastIndex = pattern.endIndex;
  }

  // Add remaining text
  if (lastIndex < content.length) {
    const textAfter = content.slice(lastIndex);
    if (textAfter.trim()) {
      segments.push({ type: 'text', content: textAfter });
    }
  }

  return (
    <div className={cn('space-y-2', className)}>
      {segments.map((segment, index) => {
        if (segment.type === 'text' && segment.content) {
          return (
            <div key={index} className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                {segment.content}
              </ReactMarkdown>
            </div>
          );
        }

        if (segment.type === 'pattern' && segment.pattern) {
          return <PatternRenderer key={index} pattern={segment.pattern} tenantSlug={tenantSlug} />;
        }

        return null;
      })}
    </div>
  );
}
