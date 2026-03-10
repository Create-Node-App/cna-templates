'use client';

import type { ReactNode } from 'react';

import { cn } from '@/shared/lib/utils';

import { useRevealOnScroll } from '../../hooks/use-reveal-on-scroll';

interface RevealOnScrollProps {
  children: ReactNode;
  className?: string;
  /** IntersectionObserver threshold (default 0.15) */
  threshold?: number;
  /** Additional delay in ms for staggered reveals */
  delay?: number;
}

/**
 * RevealOnScroll — wraps content to fade+slide in when scrolled into view.
 *
 * Uses the CSS classes from globals.css (reveal-hidden / reveal-visible)
 * and the useRevealOnScroll hook (IntersectionObserver).
 */
export function RevealOnScroll({ children, className, threshold, delay }: RevealOnScrollProps) {
  const { ref, isVisible } = useRevealOnScroll({ threshold });

  return (
    <div
      ref={ref}
      className={cn(isVisible ? 'reveal-visible' : 'reveal-hidden', className)}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
