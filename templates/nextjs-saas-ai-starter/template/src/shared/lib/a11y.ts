/**
 * Accessibility (a11y) Utilities
 * WCAG 2.1 contrast ratio validation and accessibility helpers
 */

/**
 * Convert hex color to RGB values
 * @param hex - Hex color string (e.g., "#FF5733" or "FF5733")
 * @returns RGB object with r, g, b values (0-255) or null if invalid
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  // Remove # if present
  const cleanHex = hex.replace(/^#/, '');

  // Validate hex format
  if (!/^[0-9A-F]{6}$/i.test(cleanHex)) {
    return null;
  }

  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);

  return { r, g, b };
}

/**
 * Calculate relative luminance of a color (WCAG formula)
 * @param rgb - RGB object with r, g, b values (0-255)
 * @returns Luminance value (0-1)
 */
export function calculateLuminance(rgb: { r: number; g: number; b: number }): number {
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((val) => {
    const normalized = val / 255;
    return normalized <= 0.03928 ? normalized / 12.92 : Math.pow((normalized + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculate WCAG 2.1 contrast ratio between two colors
 * @param color1 - Hex color string (foreground)
 * @param color2 - Hex color string (background)
 * @returns Contrast ratio (1-21) or null if colors are invalid
 */
export function calculateContrastRatio(color1: string, color2: string): number | null {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) {
    return null;
  }

  const lum1 = calculateLuminance(rgb1);
  const lum2 = calculateLuminance(rgb2);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast ratio meets WCAG AA standard
 * AA: Normal text >= 4.5:1, Large text >= 3:1
 * @param color1 - Hex color string (foreground)
 * @param color2 - Hex color string (background)
 * @param isLargeText - Whether text is large (18px+ or 14px+ bold)
 * @returns true if meets AA standard
 */
export function meetsWCAGAA(color1: string, color2: string, isLargeText = false): boolean {
  const ratio = calculateContrastRatio(color1, color2);
  if (ratio === null) return false;

  return isLargeText ? ratio >= 3 : ratio >= 4.5;
}

/**
 * Check if contrast ratio meets WCAG AAA standard
 * AAA: Normal text >= 7:1, Large text >= 4.5:1
 * @param color1 - Hex color string (foreground)
 * @param color2 - Hex color string (background)
 * @param isLargeText - Whether text is large (18px+ or 14px+ bold)
 * @returns true if meets AAA standard
 */
export function meetsWCAGAAA(color1: string, color2: string, isLargeText = false): boolean {
  const ratio = calculateContrastRatio(color1, color2);
  if (ratio === null) return false;

  return isLargeText ? ratio >= 4.5 : ratio >= 7;
}

/**
 * Get human-readable contrast ratio description
 * @param ratio - Contrast ratio value
 * @returns Description of the contrast level
 */
export function getContrastRatioDescription(ratio: number | null): string {
  if (ratio === null) {
    return 'Invalid colors';
  }

  if (ratio >= 7) {
    return `${ratio.toFixed(2)}:1 - Excellent (AAA+)`;
  }
  if (ratio >= 4.5) {
    return `${ratio.toFixed(2)}:1 - Good (AA)`;
  }
  if (ratio >= 3) {
    return `${ratio.toFixed(2)}:1 - Fair (Large text only)`;
  }

  return `${ratio.toFixed(2)}:1 - Poor (Fails AA)`;
}

/**
 * Validate a color pair and return comprehensive feedback
 * @param foreground - Hex color string (text color)
 * @param background - Hex color string (background color)
 * @returns Object with validation results and recommendations
 */
export function validateColorContrast(
  foreground: string,
  background: string,
): {
  ratio: number | null;
  meetsAA: boolean;
  meetsAAA: boolean;
  meetsLargeTextAA: boolean;
  description: string;
  recommendation: string;
} {
  const ratio = calculateContrastRatio(foreground, background);
  const meetsAA = meetsWCAGAA(foreground, background, false);
  const meetsAAA = meetsWCAGAAA(foreground, background, false);
  const meetsLargeTextAA = meetsWCAGAA(foreground, background, true);

  let recommendation = '✓ Colors meet WCAG AA standard for all text sizes';
  if (meetsAAA) {
    recommendation = '✓ Colors meet WCAG AAA standard - Excellent accessibility';
  } else if (meetsLargeTextAA && !meetsAA) {
    recommendation = '⚠ Colors meet WCAG AA only for large text (18px+ or 14px+ bold)';
  } else if (!meetsLargeTextAA && !meetsAA) {
    recommendation = '❌ Colors fail WCAG AA standard - Increase contrast or adjust colors';
  }

  return {
    ratio,
    meetsAA,
    meetsAAA,
    meetsLargeTextAA,
    description: getContrastRatioDescription(ratio),
    recommendation,
  };
}

/**
 * List of accessible color pairs for quick reference
 * Guaranteed to meet at least WCAG AA standard
 */
export const accessibleColorPairs = {
  darkTextOnLight: {
    foreground: '#000000',
    background: '#FFFFFF',
    ratio: 21,
    level: 'AAA',
  },
  lightTextOnDark: {
    foreground: '#FFFFFF',
    background: '#000000',
    ratio: 21,
    level: 'AAA',
  },
  brandPrimaryDarkOnLight: {
    foreground: '#1F2937',
    background: '#F3F4F6',
    ratio: 12.63,
    level: 'AAA',
  },
  brandSecondaryOnLight: {
    foreground: '#4F5BD5',
    background: '#FFFFFF',
    ratio: 5.02,
    level: 'AA',
  },
};
