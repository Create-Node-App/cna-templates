'use client';

/**
 * Toast compatibility layer — wraps Sonner with the old useToast API.
 *
 * All 30+ call-sites use:
 *   const { toast } = useToast();
 *   toast({ title: '...', description: '...', variant: 'destructive' });
 *
 * This module translates those calls to sonner's `toast()` / `toast.error()`.
 * The <ToastProvider> is now a no-op since <Toaster /> (from sonner.tsx) handles
 * rendering and is mounted in the root layout.
 */

import { type ReactNode } from 'react';
import { toast as sonnerToast } from 'sonner';

interface ToastProps {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

export function useToast() {
  const toast = (props: ToastProps) => {
    if (props.variant === 'destructive') {
      sonnerToast.error(props.title, { description: props.description });
    } else {
      sonnerToast.success(props.title, { description: props.description });
    }
  };

  return { toast, dismiss: sonnerToast.dismiss, toasts: [] as ToastProps[] };
}

/**
 * Legacy no-op provider kept for backwards compatibility.
 * The actual rendering is done by <Toaster /> from sonner.tsx mounted in the layout.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
