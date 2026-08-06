import type { Meta, StoryObj } from '@storybook/react';

/**
 * # Brand Identity
 *
 * Visual reference for Next.js SaaS AI Template's five signature elements.
 * See docs/DESIGN_SYSTEM.md Section 8: Visual Signature
 * and docs/BRAND_GUIDELINES.md for full brand documentation.
 *
 * ## The Five Signature Elements
 *
 * 1. **Domain Accent Bar** — 3px colored left border on cards
 * 2. **Premium Elevation** — Layered shadows for depth
 * 3. **Solid Primary Action** — No gradient on buttons
 * 4. **The Brand Moment** — ONE gradient (logo + hero only)
 * 5. **Warm Neutral Canvas** — Slightly warm backgrounds
 */

function BrandIdentityShowcase() {
  return (
    <div className="space-y-8 p-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-1">Next.js SaaS AI Template Brand Identity</h2>
        <p className="text-muted-foreground text-sm mb-6">
          Five signature elements that define Next.js SaaS AI Template&apos;s visual identity. These replace the
          previous &quot;gradients everywhere&quot; approach.
        </p>
      </div>

      {/* 1. Domain Accent Bar */}
      <div>
        <h3 className="text-lg font-semibold mb-3">1. The Domain Accent Bar</h3>
        <p className="text-sm text-muted-foreground mb-4">
          A consistent 3px left border that communicates domain at a glance. This is the PRIMARY visual signature of
          Next.js SaaS AI Template.
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { name: 'Skills', color: 'oklch(55% 0.18 290)' },
            { name: 'OKRs', color: 'oklch(58% 0.17 155)' },
            { name: 'Learning', color: 'oklch(58% 0.15 230)' },
            { name: 'Performance', color: 'oklch(65% 0.17 55)' },
            { name: 'Projects', color: 'oklch(55% 0.17 265)' },
            { name: 'Recognition', color: 'oklch(62% 0.19 15)' },
            { name: 'One-on-One', color: 'oklch(58% 0.14 175)' },
            { name: 'Interests', color: 'oklch(70% 0.16 75)' },
          ].map((domain) => (
            <div
              key={domain.name}
              className="rounded-lg p-3"
              style={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderLeft: `3px solid ${domain.color}`,
                boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
              }}
            >
              <p className="text-sm font-semibold">{domain.name}</p>
              <p className="text-xs text-muted-foreground">Sample card content</p>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Premium Elevation */}
      <div>
        <h3 className="text-lg font-semibold mb-3">2. Premium Elevation</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Cards float with layered shadows. Hover increases elevation. Replaces gradient backgrounds as the primary
          depth mechanism.
        </p>
        <div className="flex gap-4 items-center">
          <div
            className="rounded-lg p-4 w-40 text-center"
            style={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
            }}
          >
            <p className="text-sm font-medium">Rest</p>
            <p className="text-xs text-muted-foreground">shadow-sm</p>
          </div>
          <span className="text-muted-foreground">→</span>
          <div
            className="rounded-lg p-4 w-40 text-center"
            style={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              boxShadow: '0 4px 6px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.03)',
            }}
          >
            <p className="text-sm font-medium">Hover</p>
            <p className="text-xs text-muted-foreground">shadow-md</p>
          </div>
        </div>
      </div>

      {/* 3. Solid Primary Action */}
      <div>
        <h3 className="text-lg font-semibold mb-3">3. The Primary Action</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Primary buttons are solid bg-primary with NO gradient. They are the ONLY strongly colored interactive
          elements.
        </p>
        <div className="flex gap-3 items-center">
          <button
            className="px-4 py-2 rounded-lg font-medium text-sm shadow-sm transition-all active:scale-[0.98]"
            style={{
              backgroundColor: 'hsl(var(--primary))',
              color: 'hsl(var(--primary-foreground))',
            }}
          >
            Primary Action
          </button>
          <button
            className="px-4 py-2 rounded-lg font-medium text-sm shadow-sm transition-all"
            style={{
              backgroundColor: 'hsl(var(--background))',
              color: 'hsl(var(--foreground))',
              border: '1px solid hsl(var(--border))',
            }}
          >
            Secondary
          </button>
          <button
            className="px-4 py-2 rounded-lg font-medium text-sm transition-all"
            style={{ color: 'hsl(var(--primary))' }}
          >
            Ghost
          </button>
        </div>
      </div>

      {/* 4. The Brand Moment */}
      <div>
        <h3 className="text-lg font-semibold mb-3">4. The Brand Moment</h3>
        <p className="text-sm text-muted-foreground mb-4">
          ONE gradient in the entire app: primary → secondary. Appears ONLY on the logo mark and hero banners.
        </p>
        <div className="flex items-center gap-4">
          {/* Logo mark */}
          <div className="h-12 w-12 rounded-xl brand-gradient shadow-sm flex items-center justify-center">
            <span className="text-xl font-bold text-white">S</span>
          </div>
          {/* Wordmark */}
          <span className="text-2xl font-bold">
            <span className="brand-gradient-text">Skill</span>
            <span className="text-foreground">House</span>
          </span>
        </div>
        <div className="mt-4 h-16 rounded-lg brand-gradient flex items-center justify-center">
          <span className="text-white font-semibold">Hero Banner — the one gradient moment</span>
        </div>
      </div>

      {/* 5. Warm Neutral Canvas */}
      <div>
        <h3 className="text-lg font-semibold mb-3">5. Warm Neutral Canvas</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Slightly warm background that feels human and editorial. Not pure white (clinical), not pure gray (cold).
        </p>
        <div className="flex gap-3">
          {[
            { name: 'Background', v: '--background' },
            { name: 'Card', v: '--card' },
            { name: 'Muted', v: '--muted' },
          ].map((n) => (
            <div
              key={n.v}
              className="w-20 h-20 rounded-lg flex items-center justify-center"
              style={{
                backgroundColor: `hsl(var(${n.v}))`,
                border: '1px solid hsl(var(--border))',
              }}
            >
              <span className="text-xs text-muted-foreground">{n.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const meta: Meta = {
  title: 'Design System/Brand Identity',
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj;

export const VisualSignature: Story = {
  render: () => <BrandIdentityShowcase />,
};
