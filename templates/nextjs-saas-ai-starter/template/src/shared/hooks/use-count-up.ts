'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * useCountUp — animates a number from 0 to a target value with an ease-out curve.
 *
 * Only starts counting when the element is visible in the viewport.
 * Pure JavaScript animation using requestAnimationFrame — no dependencies.
 *
 * @param target - The final number to count up to
 * @param options.duration - Animation duration in ms (default 600)
 * @param options.decimals - Decimal places to show (default 0)
 */
export function useCountUp(target: number, options?: { duration?: number; decimals?: number }) {
  const { duration = 600, decimals = 0 } = options ?? {};
  const ref = useRef<HTMLElement>(null);
  const [value, setValue] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || hasAnimated.current) return;

    // Respect prefers-reduced-motion — skip animation, set value via rAF
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      hasAnimated.current = true;
      // Use rAF to avoid synchronous setState in effect body
      const id = requestAnimationFrame(() => setValue(target));
      return () => cancelAnimationFrame(id);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          observer.disconnect();

          const startTime = performance.now();

          const animate = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-out cubic: fast start, slow end
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = eased * target;

            setValue(decimals > 0 ? parseFloat(current.toFixed(decimals)) : Math.round(current));

            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          };

          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration, decimals]);

  return { ref, value };
}
