'use client';

import { AlertCircle, CheckCircle2, Layout, Moon, Palette, Sparkles, Sun, Type } from 'lucide-react';
import { useState } from 'react';

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Switch,
} from '@/shared/components/ui';
import { validateColorContrast } from '@/shared/lib/a11y';
import type { TenantSettings } from '@/shared/lib/tenant-settings';

import { useSettings } from './SettingsProvider';

/**
 * Enhanced branding settings with all new design system fields.
 *
 * Organized into collapsible sections:
 * - Colors (primary, secondary, accent)
 * - Shape & Surface (border radius, surface style)
 * - Typography & Density
 * - Brand Identity (logo, display name, gradient toggle)
 * - Regional (language, date format, dark mode)
 * - Theme Presets (quick-apply gallery)
 *
 * Includes a live preview panel showing the effect of current settings.
 *
 * See docs/DESIGN_SYSTEM.md Section 10: Tenant Branding
 */

// --- Theme Presets ---
const THEME_PRESETS: Array<{
  name: string;
  description: string;
  values: Partial<NonNullable<TenantSettings['ui']>>;
}> = [
  {
    name: 'Default',
    description: 'Indigo primary, violet secondary, teal accent',
    values: {
      primaryColor: '#4F5BD5',
      secondaryColor: '#7C6EAF',
      accentColor: '#2BA8A4',
      neutralWarmth: 'warm',
      borderRadius: 'lg',
      surfaceStyle: 'elevated',
    },
  },
  {
    name: 'Corporate Blue',
    description: 'Navy primary, slate secondary, sky accent',
    values: {
      primaryColor: '#1E40AF',
      secondaryColor: '#475569',
      accentColor: '#0EA5E9',
      neutralWarmth: 'cool',
      borderRadius: 'md',
      surfaceStyle: 'elevated',
    },
  },
  {
    name: 'Modern Green',
    description: 'Emerald primary, forest secondary, lime accent',
    values: {
      primaryColor: '#059669',
      secondaryColor: '#166534',
      accentColor: '#84CC16',
      neutralWarmth: 'neutral',
      borderRadius: 'lg',
      surfaceStyle: 'elevated',
    },
  },
  {
    name: 'Warm Sunset',
    description: 'Coral primary, amber secondary, gold accent',
    values: {
      primaryColor: '#DC2626',
      secondaryColor: '#D97706',
      accentColor: '#EAB308',
      neutralWarmth: 'warm',
      borderRadius: 'xl',
      surfaceStyle: 'elevated',
    },
  },
  {
    name: 'Monochrome',
    description: 'Slate primary, gray secondary, neutral',
    values: {
      primaryColor: '#334155',
      secondaryColor: '#6B7280',
      accentColor: '#9CA3AF',
      neutralWarmth: 'cool',
      borderRadius: 'sm',
      surfaceStyle: 'flat',
    },
  },
];

// --- Helper components ---

/**
 * Contrast feedback component showing WCAG compliance
 */
function ContrastFeedback({
  primaryColor,
  backgroundColor = '#FFFFFF',
}: {
  primaryColor: string;
  backgroundColor?: string;
}) {
  const validation = validateColorContrast(primaryColor, backgroundColor);

  if (!validation.ratio) return null;

  const isGood = validation.meetsAA;
  const Icon = isGood ? CheckCircle2 : AlertCircle;
  const color = isGood ? 'text-success' : 'text-warning';

  return (
    <div className={`flex items-start gap-2 p-2 rounded-md bg-muted text-sm ${color}`}>
      <Icon className="h-4 w-4 mt-0.5 flex-shrink-0" />
      <div>
        <p className="font-medium">{validation.description}</p>
        <p className="text-xs opacity-80">{validation.recommendation}</p>
      </div>
    </div>
  );
}

function ColorField({
  label,
  id,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-center gap-3 mt-2">
        <input
          type="color"
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-14 rounded border cursor-pointer"
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-32 font-mono"
          placeholder={placeholder}
        />
      </div>
    </div>
  );
}

function RadioGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: Array<{ value: string; label: string }>;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-2 mt-2">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              value === option.value
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted text-muted-foreground hover:bg-accent'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function SectionHeader({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2 pt-4 pb-2 border-t border-border first:border-t-0 first:pt-0">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
    </div>
  );
}

// --- Live Preview ---
function BrandingPreview({
  ui,
  isDark,
  onToggleDark,
}: {
  ui: NonNullable<TenantSettings['ui']>;
  isDark: boolean;
  onToggleDark: () => void;
}) {
  const getSurfaceStyleLabel = (): string => {
    switch (ui.surfaceStyle) {
      case 'flat':
        return 'Flat (No shadows)';
      case 'glass':
        return 'Glass (Backdrop blur)';
      default:
        return 'Elevated (Layered shadows)';
    }
  };

  const getDensityLabel = (): string => {
    switch (ui.density) {
      case 'compact':
        return 'Compact (Tight spacing)';
      case 'comfortable':
        return 'Comfortable (Loose spacing)';
      default:
        return 'Default (Standard spacing)';
    }
  };

  const getShadowStyle = (): React.CSSProperties => {
    if (ui.surfaceStyle === 'flat') {
      return { boxShadow: 'none', border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}` };
    } else if (ui.surfaceStyle === 'glass') {
      return {
        boxShadow: isDark
          ? '0 0 0 1px rgba(255, 255, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          : '0 0 0 1px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(12px)',
      };
    } else {
      return {
        boxShadow: isDark
          ? '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.3)'
          : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
      };
    }
  };

  // Map neutralWarmth to actual background colors (light/dark aware)
  const getBackgroundColor = (): string => {
    if (isDark) {
      // Dark mode backgrounds
      switch (ui.neutralWarmth) {
        case 'cool':
          return 'hsl(210, 14%, 10%)';
        case 'neutral':
          return 'hsl(0, 0%, 10%)';
        case 'warm':
          return 'hsl(30, 14%, 10%)';
        case 'soft':
          return 'hsl(240, 14%, 10%)'; // Landing dark mode
        default:
          return 'hsl(30, 14%, 10%)';
      }
    } else {
      // Light mode backgrounds
      switch (ui.neutralWarmth) {
        case 'cool':
          return 'hsl(210, 8%, 96%)';
        case 'neutral':
          return 'hsl(0, 0%, 96%)';
        case 'warm':
          return 'hsl(30, 8%, 96%)';
        case 'soft':
          return 'hsl(240, 14%, 96%)';
        default:
          return 'hsl(30, 8%, 96%)';
      }
    }
  };

  const getCardColor = (): string => {
    if (isDark) {
      switch (ui.neutralWarmth) {
        case 'cool':
          return 'hsl(210, 14%, 10%)';
        case 'neutral':
          return 'hsl(0, 0%, 10%)';
        case 'warm':
          return 'hsl(30, 14%, 10%)';
        case 'soft':
          return 'hsl(240, 14%, 10%)';
        default:
          return 'hsl(30, 14%, 10%)';
      }
    } else {
      switch (ui.neutralWarmth) {
        case 'cool':
          return 'hsl(210, 6%, 98%)';
        case 'neutral':
          return 'hsl(0, 0%, 98%)';
        case 'warm':
          return 'hsl(30, 6%, 98%)';
        case 'soft':
          return 'hsl(240, 14%, 98%)';
        default:
          return 'hsl(30, 6%, 98%)';
      }
    }
  };

  const getMutedColor = (): string => {
    if (isDark) {
      switch (ui.neutralWarmth) {
        case 'cool':
          return 'hsl(210, 10%, 18%)';
        case 'neutral':
          return 'hsl(0, 0%, 18%)';
        case 'warm':
          return 'hsl(30, 10%, 18%)';
        case 'soft':
          return 'hsl(240, 10%, 18%)';
        default:
          return 'hsl(30, 10%, 18%)';
      }
    } else {
      switch (ui.neutralWarmth) {
        case 'cool':
          return 'hsl(210, 8%, 92%)';
        case 'neutral':
          return 'hsl(0, 0%, 92%)';
        case 'warm':
          return 'hsl(30, 8%, 92%)';
        case 'soft':
          return 'hsl(240, 10%, 92%)';
        default:
          return 'hsl(30, 8%, 92%)';
      }
    }
  };

  const getBorderColor = (): string => {
    if (isDark) {
      switch (ui.neutralWarmth) {
        case 'cool':
          return 'hsl(210, 10%, 22%)';
        case 'neutral':
          return 'hsl(0, 0%, 22%)';
        case 'warm':
          return 'hsl(30, 10%, 22%)';
        case 'soft':
          return 'hsl(240, 10%, 22%)';
        default:
          return 'hsl(30, 10%, 22%)';
      }
    } else {
      switch (ui.neutralWarmth) {
        case 'cool':
          return 'hsl(210, 6%, 88%)';
        case 'neutral':
          return 'hsl(0, 0%, 88%)';
        case 'warm':
          return 'hsl(30, 6%, 88%)';
        case 'soft':
          return 'hsl(240, 10%, 88%)';
        default:
          return 'hsl(30, 6%, 88%)';
      }
    }
  };

  const getForegroundColor = (): string => {
    if (isDark) {
      switch (ui.neutralWarmth) {
        case 'cool':
          return 'hsl(210, 8%, 93%)';
        case 'neutral':
          return 'hsl(0, 0%, 93%)';
        case 'warm':
          return 'hsl(30, 8%, 93%)';
        case 'soft':
          return 'hsl(240, 8%, 93%)';
        default:
          return 'hsl(30, 8%, 93%)';
      }
    } else {
      switch (ui.neutralWarmth) {
        case 'cool':
          return 'hsl(210, 10%, 16%)';
        case 'neutral':
          return 'hsl(0, 0%, 16%)';
        case 'warm':
          return 'hsl(30, 10%, 16%)';
        case 'soft':
          return 'hsl(240, 8%, 16%)';
        default:
          return 'hsl(30, 10%, 16%)';
      }
    }
  };

  const getMutedForegroundColor = (): string => {
    if (isDark) {
      switch (ui.neutralWarmth) {
        case 'cool':
          return 'hsl(210, 5%, 62%)';
        case 'neutral':
          return 'hsl(0, 0%, 62%)';
        case 'warm':
          return 'hsl(30, 5%, 62%)';
        case 'soft':
          return 'hsl(240, 5%, 62%)';
        default:
          return 'hsl(30, 5%, 62%)';
      }
    } else {
      switch (ui.neutralWarmth) {
        case 'cool':
          return 'hsl(210, 5%, 42%)';
        case 'neutral':
          return 'hsl(0, 0%, 42%)';
        case 'warm':
          return 'hsl(30, 5%, 42%)';
        case 'soft':
          return 'hsl(240, 5%, 42%)';
        default:
          return 'hsl(30, 5%, 42%)';
      }
    }
  };

  const getDensityMultiplier = (): number => {
    switch (ui.density) {
      case 'compact':
        return 0.75;
      case 'comfortable':
        return 1.25;
      default:
        return 1;
    }
  };

  const getBorderRadius = (): string => {
    switch (ui.borderRadius) {
      case 'none':
        return '0';
      case 'sm':
        return '0.25rem';
      case 'md':
        return '0.5rem';
      case 'lg':
        return '0.625rem';
      case 'xl':
        return '1rem';
      default:
        return '0.625rem';
    }
  };

  const densityMultiplier = getDensityMultiplier();
  const baseSpacing = 1; // rem
  const cardPadding = `${baseSpacing * densityMultiplier}rem`;
  const elementGap = `${0.5 * densityMultiplier}rem`;

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <div className="bg-card border-b border-border p-3 flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Live Preview</p>
          <p className="text-xs text-muted-foreground mt-1">Real-time preview of your branding settings</p>
        </div>
        <button
          onClick={onToggleDark}
          className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted hover:bg-muted/80 transition-colors text-xs font-medium text-foreground"
          type="button"
        >
          {isDark ? (
            <>
              <Moon className="h-3 w-3" />
              Dark
            </>
          ) : (
            <>
              <Sun className="h-3 w-3" />
              Light
            </>
          )}
        </button>
      </div>

      {/* Preview container with actual background */}
      <div
        className="p-4 transition-all duration-300"
        style={{
          backgroundColor: getBackgroundColor(),
          fontFamily:
            ui.fontFamily === 'inter'
              ? 'Inter, sans-serif'
              : ui.fontFamily === 'open-sans'
                ? 'Open Sans, sans-serif'
                : ui.fontFamily === 'system'
                  ? 'system-ui, sans-serif'
                  : 'DM Sans, sans-serif',
        }}
      >
        {/* Settings summary badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span
            className="text-[10px] font-medium px-2 py-1 rounded-full"
            style={{
              backgroundColor: getMutedColor(),
              color: getForegroundColor(),
            }}
          >
            {ui.neutralWarmth === 'cool'
              ? '❄️ Cool'
              : ui.neutralWarmth === 'neutral'
                ? '⚪ Neutral'
                : ui.neutralWarmth === 'warm'
                  ? '🔥 Warm'
                  : '✨ Soft'}
          </span>
          <span
            className="text-[10px] font-medium px-2 py-1 rounded-full"
            style={{
              backgroundColor: getMutedColor(),
              color: getForegroundColor(),
            }}
          >
            {getDensityLabel().split(' ')[0]}
          </span>
          <span
            className="text-[10px] font-medium px-2 py-1 rounded-full"
            style={{
              backgroundColor: getMutedColor(),
              color: getForegroundColor(),
            }}
          >
            {getSurfaceStyleLabel().split(' ')[0]}
          </span>
        </div>

        {/* Sample card with all styling applied */}
        <div
          className="transition-all duration-300"
          style={{
            ...getShadowStyle(),
            backgroundColor: getCardColor(),
            borderRadius: getBorderRadius(),
            padding: cardPadding,
          }}
        >
          {/* Card header */}
          <div className="flex items-center gap-2" style={{ marginBottom: elementGap }}>
            <div
              className="flex items-center justify-center text-white text-xs font-bold"
              style={{
                backgroundColor: ui.primaryColor,
                borderRadius: getBorderRadius(),
                width: `${2 * densityMultiplier}rem`,
                height: `${2 * densityMultiplier}rem`,
              }}
            >
              S
            </div>
            <div>
              <h3 className="font-semibold" style={{ color: getForegroundColor(), fontSize: '0.875rem' }}>
                Sample Card
              </h3>
              <p style={{ color: getMutedForegroundColor(), fontSize: '0.75rem' }}>With current branding</p>
            </div>
          </div>

          {/* Card content */}
          <p
            className="leading-relaxed"
            style={{
              color: getMutedForegroundColor(),
              fontSize: '0.75rem',
              marginBottom: elementGap,
            }}
          >
            This preview shows how your application will look with the selected background tone, surface style, density,
            and border radius.
          </p>

          {/* Sample input */}
          <div style={{ marginBottom: elementGap }}>
            <label
              htmlFor="sample-input-preview"
              className="block font-medium"
              style={{ color: getForegroundColor(), fontSize: '0.75rem', marginBottom: '0.25rem' }}
            >
              Sample Input
            </label>
            <input
              id="sample-input-preview"
              type="text"
              placeholder="Type here..."
              className="w-full transition-all"
              style={{
                backgroundColor: getCardColor(),
                color: getForegroundColor(),
                border: `1px solid ${getBorderColor()}`,
                borderRadius: getBorderRadius(),
                padding: `${0.375 * densityMultiplier}rem ${0.75 * densityMultiplier}rem`,
                fontSize: '0.75rem',
              }}
              disabled
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-2" style={{ marginTop: elementGap }}>
            <button
              type="button"
              className="font-medium text-white transition-all"
              style={{
                backgroundColor: ui.primaryColor,
                borderRadius: getBorderRadius(),
                padding: `${0.375 * densityMultiplier}rem ${0.75 * densityMultiplier}rem`,
                fontSize: '0.75rem',
              }}
            >
              Primary
            </button>
            <button
              type="button"
              className="font-medium text-white transition-all"
              style={{
                backgroundColor: ui.secondaryColor,
                borderRadius: getBorderRadius(),
                padding: `${0.375 * densityMultiplier}rem ${0.75 * densityMultiplier}rem`,
                fontSize: '0.75rem',
              }}
            >
              Secondary
            </button>
            <button
              type="button"
              className="font-medium transition-all"
              style={{
                backgroundColor: getMutedColor(),
                color: getForegroundColor(),
                borderRadius: getBorderRadius(),
                padding: `${0.375 * densityMultiplier}rem ${0.75 * densityMultiplier}rem`,
                fontSize: '0.75rem',
              }}
            >
              Muted
            </button>
          </div>
        </div>

        {/* Brand gradient preview */}
        {ui.brandGradientEnabled && (
          <div
            className="mt-3 transition-all duration-300"
            style={{
              height: '0.5rem',
              borderRadius: getBorderRadius(),
              background: `linear-gradient(to right, ${ui.primaryColor}, ${ui.secondaryColor})`,
            }}
          />
        )}
      </div>
    </div>
  );
}

// --- Main Component ---
export function BrandingSettings() {
  const { ui, settings, setSettings, isPending, handleSave } = useSettings();
  const [previewDark, setPreviewDark] = useState(false);

  const updateUi = (updates: Partial<NonNullable<TenantSettings['ui']>>) => {
    setSettings({
      ...settings,
      ui: { ...ui, ...updates },
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Branding & Customization</CardTitle>
        <CardDescription>
          Customize the look and feel of your workspace. Changes are applied in real-time via the design system.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
          {/* Left: Settings form */}
          <div className="space-y-6">
            {/* --- Theme Presets --- */}
            <div>
              <SectionHeader icon={Sparkles} title="Theme Presets" />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                {THEME_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => updateUi(preset.values)}
                    className="p-3 rounded-lg border border-border bg-card text-left hover:border-primary/40 transition-colors group"
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: preset.values.primaryColor }} />
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: preset.values.secondaryColor }} />
                      {preset.values.accentColor && (
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: preset.values.accentColor }} />
                      )}
                    </div>
                    <p className="text-xs font-medium group-hover:text-primary transition-colors">{preset.name}</p>
                    <p className="text-[10px] text-muted-foreground">{preset.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* --- Colors --- */}
            <SectionHeader icon={Palette} title="Colors" />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <ColorField
                  label="Primary Color"
                  id="primary-color"
                  value={ui.primaryColor}
                  onChange={(v) => updateUi({ primaryColor: v })}
                  placeholder="#4F5BD5"
                />
                <div className="mt-2">
                  <ContrastFeedback primaryColor={ui.primaryColor} backgroundColor="#FFFFFF" />
                </div>
              </div>
              <div>
                <ColorField
                  label="Secondary Color"
                  id="secondary-color"
                  value={ui.secondaryColor}
                  onChange={(v) => updateUi({ secondaryColor: v })}
                  placeholder="#7C6EAF"
                />
                <div className="mt-2">
                  <ContrastFeedback primaryColor={ui.secondaryColor} backgroundColor="#FFFFFF" />
                </div>
              </div>
              <div>
                <ColorField
                  label="Accent Color"
                  id="accent-color"
                  value={ui.accentColor ?? '#2BA8A4'}
                  onChange={(v) => updateUi({ accentColor: v })}
                  placeholder="#2BA8A4"
                />
                <div className="mt-2">
                  <ContrastFeedback primaryColor={ui.accentColor ?? '#2BA8A4'} backgroundColor="#FFFFFF" />
                </div>
              </div>
            </div>

            {/* --- Neutral Warmth --- */}
            <SectionHeader icon={Palette} title="Neutral Warmth" />
            <RadioGroup
              label="Background Tone"
              options={[
                { value: 'cool', label: 'Cool (Blue undertone)' },
                { value: 'neutral', label: 'Neutral (Pure gray)' },
                { value: 'warm', label: 'Warm (Orange undertone)' },
                { value: 'soft', label: 'Soft (Violet undertone, landing style)' },
              ]}
              value={ui.neutralWarmth ?? 'warm'}
              onChange={(v) => updateUi({ neutralWarmth: v as 'cool' | 'neutral' | 'warm' | 'soft' })}
            />

            {/* --- Shape & Surface --- */}
            <SectionHeader icon={Layout} title="Shape & Surface" />
            <div className="grid gap-6 sm:grid-cols-2">
              <RadioGroup
                label="Border Radius"
                options={[
                  { value: 'none', label: 'Sharp' },
                  { value: 'sm', label: 'Subtle' },
                  { value: 'md', label: 'Medium' },
                  { value: 'lg', label: 'Rounded' },
                  { value: 'xl', label: 'Pill' },
                ]}
                value={ui.borderRadius ?? 'lg'}
                onChange={(v) => updateUi({ borderRadius: v as NonNullable<TenantSettings['ui']>['borderRadius'] })}
              />
              <RadioGroup
                label="Surface Style"
                options={[
                  { value: 'flat', label: 'Flat' },
                  { value: 'elevated', label: 'Elevated' },
                  { value: 'glass', label: 'Glass' },
                ]}
                value={ui.surfaceStyle ?? 'elevated'}
                onChange={(v) => updateUi({ surfaceStyle: v as NonNullable<TenantSettings['ui']>['surfaceStyle'] })}
              />
            </div>

            {/* --- Typography & Density --- */}
            <SectionHeader icon={Type} title="Typography & Density" />
            <div className="grid gap-6 sm:grid-cols-2">
              <RadioGroup
                label="Font Family"
                options={[
                  { value: 'dm-sans', label: 'DM Sans' },
                  { value: 'inter', label: 'Inter' },
                  { value: 'open-sans', label: 'Open Sans' },
                  { value: 'system', label: 'System' },
                ]}
                value={ui.fontFamily ?? 'dm-sans'}
                onChange={(v) => updateUi({ fontFamily: v as NonNullable<TenantSettings['ui']>['fontFamily'] })}
              />
              <RadioGroup
                label="Density"
                options={[
                  { value: 'compact', label: 'Compact' },
                  { value: 'default', label: 'Default' },
                  { value: 'comfortable', label: 'Comfortable' },
                ]}
                value={ui.density ?? 'default'}
                onChange={(v) => updateUi({ density: v as NonNullable<TenantSettings['ui']>['density'] })}
              />
            </div>

            {/* --- Brand Identity --- */}
            <SectionHeader icon={Sparkles} title="Brand Identity" />
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <Label htmlFor="display-name">Custom Display Name</Label>
                <Input
                  id="display-name"
                  value={ui.displayName ?? ''}
                  onChange={(e) => updateUi({ displayName: e.target.value || undefined })}
                  className="mt-2"
                  placeholder="Custom name for UI"
                />
              </div>
              <div>
                <Label htmlFor="logo-url">Logo URL</Label>
                <Input
                  id="logo-url"
                  value={ui.logoUrl ?? ''}
                  onChange={(e) => updateUi({ logoUrl: e.target.value || undefined })}
                  className="mt-2"
                  placeholder="https://example.com/logo.png"
                />
              </div>
              <div className="flex items-center justify-between sm:col-span-2 pt-2">
                <div>
                  <Label>Brand Gradient</Label>
                  <p className="text-xs text-muted-foreground">Show gradient on logo and hero sections</p>
                </div>
                <Switch
                  checked={ui.brandGradientEnabled ?? true}
                  onCheckedChange={(checked) => updateUi({ brandGradientEnabled: checked })}
                  disabled={isPending}
                />
              </div>
            </div>

            {/* --- Regional & Preferences --- */}
            <SectionHeader icon={Layout} title="Regional & Preferences" />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <Label htmlFor="language">Default Language</Label>
                <select
                  id="language"
                  value={ui.defaultLanguage}
                  onChange={(e) => updateUi({ defaultLanguage: e.target.value as 'en' | 'es' | 'pt' })}
                  className="mt-2 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="en">English</option>
                  <option value="es">Espanol</option>
                  <option value="pt">Portugues</option>
                </select>
              </div>
              <div>
                <Label htmlFor="date-format">Date Format</Label>
                <select
                  id="date-format"
                  value={ui.dateFormat}
                  onChange={(e) =>
                    updateUi({ dateFormat: e.target.value as NonNullable<TenantSettings['ui']>['dateFormat'] })
                  }
                  className="mt-2 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="YYYY-MM-DD">YYYY-MM-DD (ISO)</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY (US)</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY (EU)</option>
                </select>
              </div>
              <div className="flex items-center justify-between pt-4">
                <div>
                  <Label>Dark Mode</Label>
                  <p className="text-xs text-muted-foreground">Allow dark mode switching</p>
                </div>
                <Switch
                  checked={ui.darkModeEnabled}
                  onCheckedChange={(checked) => updateUi({ darkModeEnabled: checked })}
                  disabled={isPending}
                />
              </div>
            </div>
          </div>

          {/* Right: Live Preview Panel */}
          <div className="hidden lg:block">
            <div className="sticky top-24">
              <BrandingPreview ui={ui} isDark={previewDark} onToggleDark={() => setPreviewDark(!previewDark)} />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-border">
          <Button onClick={() => handleSave('ui', { ui })} disabled={isPending}>
            Save Branding
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
