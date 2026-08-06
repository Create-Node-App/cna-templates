/**
 * Component Enhancement Patterns
 *
 * Standard size and variant support for major components.
 * Used across buttons, badges, cards, and interactive elements.
 */

/**
 * Button Size Variants
 *
 * Standard button sizes with consistent padding and font sizes.
 * Consider density setting; adjust spacing based on tenant multiplier.
 */
export const BUTTON_VARIANTS = {
  sizes: {
    xs: {
      padding: 'px-2 py-1',
      text: 'text-xs',
      icon: 'h-4 w-4',
    },
    sm: {
      padding: 'px-3 py-1.5',
      text: 'text-sm',
      icon: 'h-4 w-4',
    },
    md: {
      padding: 'px-4 py-2',
      text: 'text-base',
      icon: 'h-5 w-5',
    },
    lg: {
      padding: 'px-6 py-3',
      text: 'text-lg',
      icon: 'h-6 w-6',
    },
    xl: {
      padding: 'px-8 py-4',
      text: 'text-lg',
      icon: 'h-6 w-6',
    },
  },
  variants: {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90 active:bg-secondary/80',
    outline: 'border border-input bg-background hover:bg-muted active:bg-primary/5',
    ghost: 'hover:bg-muted active:bg-primary/5',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  },
} as const;

/**
 * Card Size Variants
 *
 * Spacing and padding for different card types.
 * Compact: dense dashboards and lists.
 * Standard: default app experience.
 * Spacious: focus and detail views.
 */
export const CARD_VARIANTS = {
  padding: {
    compact: 'p-3',
    standard: 'p-4',
    spacious: 'p-6',
  },
  spacing: {
    compact: 'gap-2',
    standard: 'gap-4',
    spacious: 'gap-6',
  },
  elevation: {
    flat: 'shadow-none border border-border',
    elevated: 'shadow-md border border-border/50',
    glass: 'backdrop-blur bg-background/50 border border-border',
  },
} as const;

/**
 * Badge Size Variants
 *
 * Badges for status, tags, and highlights.
 */
export const BADGE_VARIANTS = {
  sizes: {
    sm: 'px-2 py-1 text-xs rounded-sm',
    md: 'px-3 py-1.5 text-sm rounded-md',
    lg: 'px-4 py-2 text-base rounded-lg',
  },
  variants: {
    default: 'bg-primary/10 text-primary border border-primary/20',
    secondary: 'bg-secondary/10 text-secondary border border-secondary/20',
    outline: 'border border-border bg-background text-foreground',
    success: 'bg-success/10 text-success border border-success/20',
    warning: 'bg-warning/10 text-warning border border-warning/20',
    destructive: 'bg-destructive/10 text-destructive border border-destructive/20',
  },
} as const;

/**
 * Input Size Variants
 *
 * Consistent input sizing with optional icons.
 */
export const INPUT_VARIANTS = {
  sizes: {
    sm: {
      padding: 'px-2 py-1.5',
      text: 'text-sm',
    },
    md: {
      padding: 'px-3 py-2',
      text: 'text-base',
    },
    lg: {
      padding: 'px-4 py-3',
      text: 'text-lg',
    },
  },
  states: {
    default:
      'border border-input bg-background text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary',
    disabled: 'bg-muted text-muted-foreground opacity-50 cursor-not-allowed',
    error: 'border-destructive focus:ring-destructive focus:border-destructive',
  },
} as const;

/**
 * Breakpoint Names
 *
 * Tailwind responsive prefixes for consistent media queries.
 */
export const BREAKPOINTS = {
  mobile: 'sm', // 640px
  tablet: 'md', // 768px
  desktop: 'lg', // 1024px
  wide: 'xl', // 1280px
  ultrawide: '2xl', // 1536px
} as const;

/**
 * Z-Index Scale
 *
 * Consistent stacking context for overlays, dropdowns, modals.
 */
export const Z_INDEX = {
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  modal: 40,
  popover: 50,
  tooltip: 60,
  notification: 70,
} as const;

/**
 * Focus Ring Styles
 *
 * Accessible focus indicators for all interactive elements.
 */
export const FOCUS_STYLES = {
  ring: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
  inset: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset',
} as const;

/**
 * Transition Durations
 *
 * Standard animation timings for consistency.
 */
export const TRANSITIONS = {
  fast: 'duration-100',
  normal: 'duration-200',
  slow: 'duration-300',
  verySlow: 'duration-500',
} as const;

/**
 * Letter Spacing Adjustments
 *
 * Improve readability at different font sizes.
 */
export const LETTER_SPACING = {
  tight: 'tracking-tight', // -0.02em (headings)
  tighter: 'tracking-tighter', // -0.03em (large headings)
  normal: 'tracking-normal', // 0
  wide: 'tracking-wide', // 0.025em
} as const;
