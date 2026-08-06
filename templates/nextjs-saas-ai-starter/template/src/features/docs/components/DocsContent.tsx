'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { cn } from '@/shared/lib/utils';

import { DocsCallout } from './DocsCallout';
import { DocsLivePreview } from './DocsLivePreview';

interface DocsContentProps {
  content: string;
  className?: string;
}

export function DocsContent({ content, className }: DocsContentProps) {
  // Strip the first h1 heading — the title is already rendered from frontmatter by the page component
  const strippedContent = content.replace(/^\s*#\s+.+\n+/, '');

  return (
    <div
      className={cn(
        'prose prose-slate dark:prose-invert max-w-none',
        // Typography base - improved for 16px base with better rhythm
        'prose-base leading-relaxed text-foreground prose-p:text-base',
        // Headings - enhanced visual hierarchy and spacing
        'prose-headings:scroll-mt-20 prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-foreground',
        'prose-h1:text-4xl prose-h1:font-bold prose-h1:mb-8 prose-h1:mt-0',
        'prose-h2:mt-12 prose-h2:mb-5 prose-h2:border-b prose-h2:pb-4 prose-h2:text-3xl prose-h2:font-bold prose-h2:border-border',
        'prose-h3:mt-10 prose-h3:mb-4 prose-h3:text-2xl prose-h3:font-semibold prose-h3:text-primary/90',
        'prose-h4:mt-8 prose-h4:mb-3 prose-h4:text-xl prose-h4:font-semibold',
        'prose-h5:mt-6 prose-h5:mb-2 prose-h5:text-lg prose-h5:font-semibold',
        // Paragraphs and text - better spacing and rhythm
        'prose-p:mb-5 prose-p:leading-8',
        // Lists - improved hierarchy
        'prose-ol:list-decimal prose-ol:ml-6 prose-ol:mb-6 prose-ol:text-base',
        'prose-ul:list-disc prose-ul:ml-6 prose-ul:mb-6 prose-ul:text-base',
        'prose-li:marker:text-muted-foreground prose-li:mb-2 prose-li:leading-7',
        // Links - prominent and accessible
        'prose-a:text-primary prose-a:font-medium prose-a:no-underline prose-a:transition-colors hover:prose-a:underline hover:prose-a:text-primary/80 active:prose-a:text-primary/60',
        // Code - inline and block
        'prose-code:rounded prose-code:bg-muted prose-code:px-2 prose-code:py-1 prose-code:text-sm prose-code:font-mono prose-code:text-foreground prose-code:before:content-none prose-code:after:content-none',
        'prose-pre:rounded-lg prose-pre:border prose-pre:border-border prose-pre:bg-muted/50 prose-pre:p-5 prose-pre:overflow-x-auto prose-pre:text-sm prose-pre:shadow-sm',
        // Tables - accessible with better contrast
        'prose-table:border-collapse prose-table:w-full prose-table:border prose-table:border-border prose-table:text-sm prose-table:my-6',
        'prose-th:border prose-th:border-border prose-th:bg-primary/8 prose-th:px-4 prose-th:py-3 prose-th:font-semibold prose-th:text-foreground prose-th:text-left',
        'prose-td:border prose-td:border-border prose-td:px-4 prose-td:py-3',
        'prose-tbody:prose-tr:even:bg-muted/20',
        // Images - optimized with sizing
        'prose-img:rounded-lg prose-img:border prose-img:border-border prose-img:shadow-md prose-img:my-8 prose-img:mx-auto',
        // Blockquotes - styled as callouts
        'prose-blockquote:border-l-4 prose-blockquote:border-primary/60 prose-blockquote:bg-primary/5 prose-blockquote:rounded-r-lg prose-blockquote:p-4 prose-blockquote:py-3 prose-blockquote:not-italic prose-blockquote:my-6 prose-blockquote:text-foreground',
        // Strong and emphasis
        'prose-strong:font-semibold prose-strong:text-foreground',
        'prose-em:italic prose-em:text-foreground',
        // Horizontal rules
        'prose-hr:border-border prose-hr:my-8',
        className,
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Custom heading IDs for TOC linking
          h2: ({ children, ...props }) => {
            const id = generateId(children);
            return (
              <h2 id={id} {...props}>
                {children}
              </h2>
            );
          },
          h3: ({ children, ...props }) => {
            const id = generateId(children);
            return (
              <h3 id={id} {...props}>
                {children}
              </h3>
            );
          },
          // Live component previews — detect ```preview code blocks
          code: ({ className, children }) => {
            const match = className?.match(/language-preview/);
            if (match && typeof children === 'string') {
              return <DocsLivePreview raw={children} />;
            }
            return <code className={className}>{children}</code>;
          },
          // Custom blockquote rendering for callouts
          blockquote: ({ children }) => {
            const text = extractText(children);
            // Support > **Tip:** or > **Warning:** etc. syntax
            const calloutMatch = text.match(/^\*\*(Tip|Warning|Info|Danger):\*\*\s*/i);
            if (calloutMatch) {
              const variant = calloutMatch[1].toLowerCase() as 'tip' | 'warning' | 'info' | 'danger';
              return <DocsCallout variant={variant}>{children}</DocsCallout>;
            }
            return (
              <blockquote className="border-l-primary/50 bg-muted/30 rounded-r-lg py-1 not-italic">
                {children}
              </blockquote>
            );
          },
        }}
      >
        {strippedContent}
      </ReactMarkdown>
    </div>
  );
}

function generateId(children: React.ReactNode): string {
  const text = typeof children === 'string' ? children : extractTextFromNode(children);
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function extractTextFromNode(node: React.ReactNode): string {
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(extractTextFromNode).join('');
  if (node && typeof node === 'object' && 'props' in node) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return extractTextFromNode((node as any).props.children);
  }
  return '';
}

function extractText(children: React.ReactNode): string {
  return extractTextFromNode(children);
}
