'use client';

import { ImageIcon } from 'lucide-react';

import { cn } from '@/shared/lib/utils';

interface DocsImagePlaceholderProps {
  alt: string;
  caption?: string;
  className?: string;
}

export function DocsImagePlaceholder({ alt, caption, className }: DocsImagePlaceholderProps) {
  return (
    <figure className={cn('my-6', className)}>
      <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/20 bg-muted/30 py-12">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <ImageIcon className="h-8 w-8" />
          <span className="text-sm">{alt}</span>
        </div>
      </div>
      {caption && <figcaption className="mt-2 text-center text-sm text-muted-foreground">{caption}</figcaption>}
    </figure>
  );
}
