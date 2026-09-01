'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * useRevealOnScroll — triggers a CSS class change when the element
 * enters the viewport, powering scroll-triggered reveal animations.
 *
 * Uses IntersectionObserver with configurable threshold.
 * The animation itself is pure CSS (see globals.css: reveal-hidden / reveal-visible).
 *
 * @param options.threshold - Fraction of element visible to trigger (default 0.15)
 * @param options.once - Only trigger once (default true)
 */
export function useRevealOnScroll(options?: { threshold?: number; once?: boolean }) {
  const { threshold = 0.15, once = true } = options ?? {};
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
      const [entry] = entries;
      if (entry.isIntersecting) {
        setIsVisible(true);
        if (once && entry.target) observer.unobserve(entry.target);
      } else if (!once) {
        setIsVisible(false);
      }
    },
    [once],
  );

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Respect prefers-reduced-motion — reveal immediately via observer callback
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      // Use a no-op observer that fires immediately with rootMargin trick
      // to avoid calling setState synchronously inside the effect body.
      const immediateObserver = new IntersectionObserver(
        ([entry]) => {
          if (entry) setIsVisible(true);
          immediateObserver.disconnect();
        },
        { threshold: 0 },
      );
      immediateObserver.observe(el);
      return () => immediateObserver.disconnect();
    }

    const observer = new IntersectionObserver(handleIntersection, { threshold });

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, handleIntersection]);

  return { ref, isVisible };
}
