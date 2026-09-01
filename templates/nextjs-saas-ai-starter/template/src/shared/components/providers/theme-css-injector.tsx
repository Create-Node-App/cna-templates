'use client';

import { useEffect } from 'react';
import { useTenantOptional } from '@/shared/providers/tenant-provider';

/**
 * ThemeCSSInjector
 *
 * Bridges tenant branding settings to CSS custom properties at runtime.
 * Converts tenant hex colors into HSL values and injects them onto <html>.
 *
 * Design System Reference: docs/DESIGN_SYSTEM.md Section 10 (Tenant Branding)
 *
 * This component:
 * 1. Reads tenant UI settings from TenantProvider context
 * 2. Converts hex colors to HSL
 * 3. Generates appropriate light/dark mode values
 * 4. Applies tenant customization: colors, border radius, font family, density, surface style, neutral warmth
 * 5. Injects CSS custom properties on document.documentElement
 * 6. Re-computes when the user toggles light/dark mode
 *
 * Wired features:
 * ✓ Primary, Secondary, Accent colors
 * ✓ Border radius
 * ✓ Font family
 * ✓ Density (spacing multiplier)
 * ✓ Surface style (flat/elevated/glass)
 * ✓ Neutral warmth (cool/neutral/warm)
 * ✓ Brand gradient
 * ✓ Chart colors
 */

// ---------------------------------------------------------------------------
// Color Conversion Utilities (no external dependency)
// ---------------------------------------------------------------------------

/** Parse hex color to RGB */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const match = hex.replace('#', '').match(/^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (!match) return null;
  return {
    r: parseInt(match[1], 16) / 255,
    g: parseInt(match[2], 16) / 255,
    b: parseInt(match[3], 16) / 255,
  };
}

/** Convert RGB to HSL. Returns { h: 0-360, s: 0-100, l: 0-100 } */
function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;

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

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/** Convert hex to HSL string for CSS variable (e.g., "245 58% 52%") */
function hexToHslString(hex: string): string | null {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  return `${hsl.h} ${hsl.s}% ${hsl.l}%`;
}

/**
 * Generate a lighter version of an HSL color for dark mode.
 * Bumps lightness up by ~15% while keeping hue and reducing saturation slightly.
 */
function lightenHsl(hex: string, lightnessBoost: number = 15): string | null {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  return `${hsl.h} ${Math.max(hsl.s - 5, 0)}% ${Math.min(hsl.l + lightnessBoost, 85)}%`;
}

/**
 * Determine if a color is "light" (needs dark foreground text)
 */
function isLightColor(hex: string): boolean {
  const rgb = hexToRgb(hex);
  if (!rgb) return false;
  // Relative luminance calculation
  const luminance = 0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b;
  return luminance > 0.5;
}

// ---------------------------------------------------------------------------
// Font Family Stacks
// ---------------------------------------------------------------------------

const FONT_FAMILY_MAP: Record<string, string> = {
  'dm-sans': '"DM Sans", sans-serif',
  inter: '"Inter", sans-serif',
  'open-sans': '"Open Sans", sans-serif',
  system: 'system-ui, -apple-system, sans-serif',
};

// ---------------------------------------------------------------------------
// Surface Style Elevation Maps
// ---------------------------------------------------------------------------

const SURFACE_ELEVATION_MAP: Record<string, Record<string, string>> = {
  flat: {
    xs: '0 0 0 rgba(0, 0, 0, 0)',
    sm: '0 0 0 rgba(0, 0, 0, 0)',
    md: '0 0 0 rgba(0, 0, 0, 0)',
    lg: '0 0 0 rgba(0, 0, 0, 0)',
    xl: '0 0 0 rgba(0, 0, 0, 0)',
  },
  elevated: {
    xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  },
  glass: {
    xs: '0 0 0 1px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
    sm: '0 0 0 1px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
    md: '0 0 0 1px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
    lg: '0 0 0 1px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.25)',
    xl: '0 0 0 1px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
  },
};

// ---------------------------------------------------------------------------
// Neutral Warmth Palettes
// ---------------------------------------------------------------------------

const NEUTRAL_WARMTH_PALETTES: Record<string, Record<string, string>> = {
  cool: {
    // Cool grays (blue undertone)
    background: '210 8% 96%',
    foreground: '210 10% 16%',
    card: '210 6% 98%',
    border: '210 6% 88%',
    input: '210 6% 88%',
    muted: '210 8% 92%',
    mutedForeground: '210 5% 42%',
  },
  neutral: {
    // Pure true grays (no undertone)
    background: '0 0% 96%',
    foreground: '0 0% 16%',
    card: '0 0% 98%',
    border: '0 0% 88%',
    input: '0 0% 88%',
    muted: '0 0% 92%',
    mutedForeground: '0 0% 42%',
  },
  warm: {
    // Warm grays (orange/brown undertone)
    background: '30 8% 96%',
    foreground: '30 10% 16%',
    card: '30 6% 98%',
    border: '30 6% 88%',
    input: '30 6% 88%',
    muted: '30 8% 92%',
    mutedForeground: '30 5% 42%',
  },
  soft: {
    // Soft purples (violet undertone, same as landing page)
    // Light mode values optimized to match dark mode when inverted
    background: '240 14% 96%',
    foreground: '240 8% 16%',
    card: '240 14% 98%',
    border: '240 10% 88%',
    input: '240 10% 88%',
    muted: '240 10% 92%',
    mutedForeground: '240 5% 42%',
  },
};

// ---------------------------------------------------------------------------
// Density Multipliers
// ---------------------------------------------------------------------------

const DENSITY_MULTIPLIER_MAP: Record<string, number> = {
  compact: 0.75,
  default: 1,
  comfortable: 1.25,
};

// ---------------------------------------------------------------------------
// Border Radius Presets
// ---------------------------------------------------------------------------

const RADIUS_MAP: Record<string, string> = {
  none: '0',
  sm: '0.25rem',
  md: '0.5rem',
  lg: '0.625rem',
  xl: '1rem',
};

export function ThemeCSSInjector() {
  const tenant = useTenantOptional();

  useEffect(() => {
    if (!tenant) return;

    // Create a MutationObserver to watch for dark mode class changes
    const updateThemeColors = () => {
      const isDark = document.documentElement.classList.contains('dark');
      applyTenantTheme(tenant, isDark);
    };

    // Initial apply
    updateThemeColors();

    // Watch for class changes on documentElement
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.attributeName === 'class') {
          updateThemeColors();
        }
      }
    });

    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, [tenant]);

  // This component renders nothing — it only injects CSS variables
  return null;
}

/**
 * Apply tenant branding colors based on light/dark mode
 */
function applyTenantTheme(tenant: ReturnType<typeof useTenantOptional>, isDark: boolean) {
  if (!tenant || !tenant.settings.ui) return;

  const ui = tenant.settings.ui;
  const root = document.documentElement;

  // Clean up previous properties
  const allProps = [
    '--primary',
    '--primary-foreground',
    '--ring',
    '--secondary',
    '--secondary-foreground',
    '--accent',
    '--accent-foreground',
    '--brand-gradient-from',
    '--brand-gradient-to',
    '--radius',
    '--chart-1',
    '--chart-2',
    '--font-family',
    '--density-multiplier',
    '--surface-style',
    '--background',
    '--foreground',
    '--card',
    '--border',
    '--input',
    '--muted',
    '--muted-foreground',
  ];
  allProps.forEach((prop) => root.style.removeProperty(prop));

  // --- Primary Color ---
  if (ui.primaryColor) {
    const primaryHsl = hexToHslString(ui.primaryColor);
    if (primaryHsl) {
      if (isDark) {
        const lightPrimary = lightenHsl(ui.primaryColor, 15);
        if (lightPrimary) {
          root.style.setProperty('--primary', lightPrimary);
          root.style.setProperty('--ring', lightPrimary);
        }
      } else {
        root.style.setProperty('--primary', primaryHsl);
        root.style.setProperty('--ring', primaryHsl);
      }
      // Primary foreground: white or dark depending on luminance
      const fg = isLightColor(ui.primaryColor) ? '240 10% 16%' : '0 0% 100%';
      root.style.setProperty('--primary-foreground', fg);
    }
  }

  // --- Secondary Color ---
  if (ui.secondaryColor) {
    const secondaryHsl = hexToHslString(ui.secondaryColor);
    if (secondaryHsl) {
      if (isDark) {
        const lightSecondary = lightenHsl(ui.secondaryColor, 12);
        if (lightSecondary) root.style.setProperty('--secondary', lightSecondary);
      } else {
        root.style.setProperty('--secondary', secondaryHsl);
      }
      const fg = isLightColor(ui.secondaryColor) ? '240 10% 16%' : '0 0% 100%';
      root.style.setProperty('--secondary-foreground', fg);
    }
  }

  // --- Accent Color (NEW) ---
  if (ui.accentColor) {
    const accentHsl = hexToHslString(ui.accentColor);
    if (accentHsl) {
      if (isDark) {
        const lightAccent = lightenHsl(ui.accentColor, 10);
        if (lightAccent) root.style.setProperty('--accent', lightAccent);
      } else {
        root.style.setProperty('--accent', accentHsl);
      }
      const fg = isLightColor(ui.accentColor) ? '240 10% 16%' : '0 0% 100%';
      root.style.setProperty('--accent-foreground', fg);
    }
  }

  // --- Brand Gradient ---
  if (ui.primaryColor && ui.secondaryColor && ui.brandGradientEnabled) {
    const fromHsl = isDark ? lightenHsl(ui.primaryColor, 15) : hexToHslString(ui.primaryColor);
    const toHsl = isDark ? lightenHsl(ui.secondaryColor, 12) : hexToHslString(ui.secondaryColor);
    if (fromHsl) root.style.setProperty('--brand-gradient-from', fromHsl);
    if (toHsl) root.style.setProperty('--brand-gradient-to', toHsl);
  }

  // --- Border Radius ---
  if (ui.borderRadius && RADIUS_MAP[ui.borderRadius]) {
    root.style.setProperty('--radius', RADIUS_MAP[ui.borderRadius]);
  }

  // --- Font Family (NEW) ---
  if (ui.fontFamily && FONT_FAMILY_MAP[ui.fontFamily]) {
    root.style.setProperty('--font-family', FONT_FAMILY_MAP[ui.fontFamily]);
  }

  // --- Density (NEW) ---
  if (ui.density && DENSITY_MULTIPLIER_MAP[ui.density] !== undefined) {
    const multiplier = DENSITY_MULTIPLIER_MAP[ui.density];
    root.style.setProperty('--density-multiplier', String(multiplier));
  }

  // --- Surface Style (NEW) ---
  if (ui.surfaceStyle && SURFACE_ELEVATION_MAP[ui.surfaceStyle]) {
    root.style.setProperty('--surface-style', ui.surfaceStyle);
    // Apply shadow presets for this surface style
    const shadows = SURFACE_ELEVATION_MAP[ui.surfaceStyle];
    root.style.setProperty('--shadow-xs', shadows.xs);
    root.style.setProperty('--shadow-sm', shadows.sm);
    root.style.setProperty('--shadow-md', shadows.md);
    root.style.setProperty('--shadow-lg', shadows.lg);
    root.style.setProperty('--shadow-xl', shadows.xl);
  }

  // --- Neutral Warmth (NEW) - Adjusted for dark mode ---
  if (ui.neutralWarmth && NEUTRAL_WARMTH_PALETTES[ui.neutralWarmth]) {
    const palette = NEUTRAL_WARMTH_PALETTES[ui.neutralWarmth];

    if (isDark) {
      // For 'soft' (landing style), use exact landing dark mode values
      if (ui.neutralWarmth === 'soft') {
        root.style.setProperty('--background', '240 14% 10%');
        root.style.setProperty('--foreground', '240 8% 93%');
        root.style.setProperty('--card', '240 14% 10%');
        root.style.setProperty('--border', '240 10% 22%');
        root.style.setProperty('--input', '240 10% 22%');
        root.style.setProperty('--muted', '240 10% 18%');
        root.style.setProperty('--muted-foreground', '240 5% 62%');
      } else {
        // Generic inversion for other warmth options
        const bgMatch = palette.background.match(/^(\d+)\s+(\d+)%\s+(\d+)%$/);
        const fgMatch = palette.foreground.match(/^(\d+)\s+(\d+)%\s+(\d+)%$/);

        if (bgMatch && fgMatch) {
          const bgHuesat = `${bgMatch[1]} ${bgMatch[2]}%`;
          const fgHuesat = `${fgMatch[1]} ${fgMatch[2]}%`;

          // Dark mode: invert lightness (96% -> 12%, 16% -> 92%)
          root.style.setProperty('--background', `${bgHuesat} 12%`);
          root.style.setProperty('--foreground', `${fgHuesat} 92%`);
          root.style.setProperty('--card', `${bgHuesat} 18%`);
          root.style.setProperty('--border', `${bgHuesat} 28%`);
          root.style.setProperty('--input', `${bgHuesat} 28%`);
          root.style.setProperty('--muted', `${bgHuesat} 22%`);
          root.style.setProperty('--muted-foreground', `${fgHuesat} 60%`);
        }
      }
    } else {
      // Light mode: use palette as-is
      root.style.setProperty('--background', palette.background);
      root.style.setProperty('--foreground', palette.foreground);
      root.style.setProperty('--card', palette.card);
      root.style.setProperty('--border', palette.border);
      root.style.setProperty('--input', palette.input);
      root.style.setProperty('--muted', palette.muted);
      root.style.setProperty('--muted-foreground', palette.mutedForeground);
    }
  }

  // --- Chart colors tied to primary ---
  if (ui.primaryColor) {
    const chartHsl = isDark ? lightenHsl(ui.primaryColor, 15) : hexToHslString(ui.primaryColor);
    if (chartHsl) root.style.setProperty('--chart-1', chartHsl);
  }
  if (ui.secondaryColor) {
    const chartHsl = isDark ? lightenHsl(ui.secondaryColor, 12) : hexToHslString(ui.secondaryColor);
    if (chartHsl) root.style.setProperty('--chart-2', chartHsl);
  }
}

export function ThemeCSSInjectorWrapper() {
  // This component renders nothing — it only injects CSS variables
  return null;
}
