/**
 * Dark Mode Utilities & Contrast Verification
 *
 * Helpers for testing and ensuring color contrast in both light and dark modes.
 * Complements src/shared/lib/a11y.ts for theme-specific validation.
 */

import { calculateContrastRatio, meetsWCAGAA, meetsWCAGAAA } from './a11y';

/**
 * Dark Mode Color Definitions
 *
 * Standard dark mode palette that ensures proper contrast.
 * These are fallback values; actual colors are set via CSS variables.
 */
export const DARK_MODE_PALETTE = {
  // Base backgrounds
  background: '#0f0f0f', // Nearly black for main background
  surface: '#1a1a1a', // Slightly lighter for cards/panels
  surfaceAlt: '#252525', // For hover/selected states
  muted: '#3a3a3a', // For disabled/muted text
  border: '#404040', // For borders and dividers

  // Text colors - high contrast
  foreground: '#f5f5f5', // Primary text (near white)
  muted_foreground: '#a0a0a0', // Secondary text

  // Status colors - adjusted for dark mode
  success: '#4ade80', // Brighter green
  warning: '#fbbf24', // Brighter amber
  destructive: '#f87171', // Brighter red
  info: '#38bdf8', // Brighter blue
} as const;

/**
 * Domain Colors for Dark Mode
 *
 * Brightened versions of domain colors to maintain readability in dark mode.
 */
export const DARK_MODE_DOMAIN_COLORS = {
  performance: '#f59e0b', // Amber - orange tinted (analytics)
  project: '#6366f1', // Indigo
  knowledge: '#0ea5e9', // Sky
  team: '#3b82f6', // Blue
} as const;

/**
 * Verify Color Contrast in Dark Mode
 *
 * Test if a foreground color has sufficient contrast against dark backgrounds.
 *
 * @param fgColor - Foreground color (hex)
 * @param bgColor - Dark background color (default: dark background)
 * @param isLargeText - Whether text is >= 18px and bold (3:1 ratio allowed)
 * @returns Object with ratio, compliance flags, and recommendations
 */
export function verifyDarkModeContrast(
  fgColor: string,
  bgColor: string = DARK_MODE_PALETTE.background,
  isLargeText: boolean = false,
) {
  const ratio = calculateContrastRatio(bgColor, fgColor) ?? 0;
  const meetsAA = meetsWCAGAA(bgColor, fgColor, isLargeText);
  const meetsAAA = meetsWCAGAAA(bgColor, fgColor, isLargeText);

  return {
    ratio: ratio.toFixed(2),
    meetsAA,
    meetsAAA,
    isLargeText,
    recommendation: getContrastRecommendation(ratio, isLargeText),
    status: meetsAA ? (meetsAAA ? '✓ WCAG AAA' : '✓ WCAG AA') : '✗ Below AA',
  };
}

/**
 * Get Contrastive Text Color for Dark Mode
 *
 * Returns either white or light gray based on the background color.
 * Useful for dynamic text color selection in dark mode.
 *
 * @param bgColor - Background color in hex
 * @returns Either white or light gray for optimal contrast
 */
export function getContrastiveTextColor(bgColor: string): string {
  const ratio = calculateContrastRatio(bgColor, '#f5f5f5') ?? 0;
  // If contrast is good enough, use white; otherwise use light gray
  return ratio > 4.5 ? '#f5f5f5' : '#a0a0a0';
}

/**
 * Lighten a Color for Dark Mode
 *
 * Increase luminance of a color to ensure it's readable in dark mode.
 * Converts hex to HSL, increases lightness, converts back.
 *
 * @param hex - Color in hex format
 * @param increaseBy - Percentage points to increase lightness (0-100)
 * @returns Lightened color in hex format
 */
export function lightenColorForDarkMode(hex: string, increaseBy: number = 20): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  hsl.l = Math.min(100, hsl.l + increaseBy);

  return hslToHex(hsl.h, hsl.s, hsl.l);
}

/**
 * Test Color Pair in Both Modes
 *
 * Useful for testing a color choice across both light and dark themes.
 *
 * @param fgColor - Foreground color
 * @param lightBg - Light mode background
 * @param darkBg - Dark mode background
 * @returns Object with contrast info for both modes
 */
export function testColorInBothModes(
  fgColor: string,
  lightBg: string = '#ffffff',
  darkBg: string = DARK_MODE_PALETTE.background,
) {
  const lightRatio = calculateContrastRatio(lightBg, fgColor) ?? 0;
  const darkRatio = calculateContrastRatio(darkBg, fgColor) ?? 0;

  return {
    lightMode: {
      ratio: lightRatio.toFixed(2),
      meetsAA: meetsWCAGAA(lightBg, fgColor),
      status: meetsWCAGAA(lightBg, fgColor) ? '✓' : '✗',
    },
    darkMode: {
      ratio: darkRatio.toFixed(2),
      meetsAA: meetsWCAGAA(darkBg, fgColor),
      status: meetsWCAGAA(darkBg, fgColor) ? '✓' : '✗',
    },
  };
}

/**
 * Recommended Dark Mode Color Adjustments
 *
 * Maps bright light-mode colors to accessible dark-mode variants.
 */
export const DARK_MODE_COLOR_ADJUSTMENTS = {
  // Primary color adjustments
  primaryBright: '#3b82f6', // Light mode
  primaryDark: '#60a5fa', // Dark mode (lighter)

  // Secondary color adjustments
  secondaryBright: '#10b981', // Light mode
  secondaryDark: '#34d399', // Dark mode (lighter)

  // Accent color adjustments
  accentBright: '#f59e0b', // Light mode
  accentDark: '#fbbf24', // Dark mode (lighter)

  // Text colors for dark mode
  textPrimary: '#f5f5f5',
  textSecondary: '#9ca3af',
  textMuted: '#6b7280',
} as const;

// ============================================================================
// Helper functions
// ============================================================================

interface RGB {
  r: number;
  g: number;
  b: number;
}

interface HSL {
  h: number;
  s: number;
  l: number;
}

function hexToRgb(hex: string): RGB | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

function rgbToHsl(r: number, g: number, b: number): HSL {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0;
  let g = 0;
  let b = 0;

  if (h >= 0 && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (h >= 60 && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (h >= 180 && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (h >= 240 && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else if (h >= 300 && h <= 360) {
    r = c;
    g = 0;
    b = x;
  }

  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function getContrastRecommendation(ratio: number, isLargeText: boolean): string {
  const minAA = isLargeText ? 3 : 4.5;
  const minAAA = isLargeText ? 4.5 : 7;

  if (ratio >= minAAA) return 'Excellent contrast (WCAG AAA)';
  if (ratio >= minAA) return 'Good contrast (WCAG AA)';
  if (ratio >= 3) return 'Consider increasing contrast for better accessibility';
  return 'Poor contrast - increase difference between foreground and background';
}
