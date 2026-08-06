'use client';

/**
 * Admin Form Dialog
 *
 * Reusable dialog for create/edit forms in admin.
 */

import { Loader2, X } from 'lucide-react';
import { useEffect, useId } from 'react';

import { Button } from '@/shared/components/ui';
import { cn } from '@/shared/lib/utils';

interface AdminFormDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting?: boolean;
  submitLabel?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function AdminFormDialog({
  open,
  onClose,
  title,
  description,
  children,
  onSubmit,
  isSubmitting,
  submitLabel = 'Save',
  size = 'md',
}: AdminFormDialogProps) {
  const titleId = useId();
  const descriptionId = useId();

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [open, isSubmitting, onClose]);

  if (!open) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="presentation">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80" onClick={() => !isSubmitting && onClose()} aria-hidden="true" />

      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        className={cn(
          'relative w-full border border-border rounded-lg shadow-2xl',
          'text-card-foreground',
          'max-h-[90vh] overflow-hidden flex flex-col',
          'animate-in fade-in-0 zoom-in-95 duration-200',
          sizeClasses[size],
          'mx-4',
        )}
        style={{ backgroundColor: 'hsl(var(--card))' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 id={titleId} className="text-lg font-semibold text-foreground">
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className="mt-1 text-sm text-muted-foreground">
                {description}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
            className="h-8 w-8 p-0"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>

        {/* Content */}
        <form onSubmit={onSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>

          {/* Footer */}
          <div
            className="flex justify-end gap-2 border-t border-border px-6 py-4"
            style={{ backgroundColor: 'hsl(var(--muted))' }}
          >
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                  Saving...
                </>
              ) : (
                submitLabel
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
