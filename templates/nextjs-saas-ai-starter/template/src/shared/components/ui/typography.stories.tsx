import type { Meta, StoryObj } from '@storybook/react';

/**
 * # Typography
 *
 * Type scale specimen for the Next.js SaaS AI Template design system.
 *
 * **Font**: DM Sans — geometric, friendly, modern
 * **Scale**: Major Third ratio (1.25)
 * **Heading style**: Semibold/bold with tighter letter-spacing
 *
 * See docs/DESIGN_SYSTEM.md Section 4: Typography
 */

function TypeScaleSpecimen() {
  return (
    <div className="space-y-8 p-6 max-w-3xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-1">Typography Scale</h2>
        <p className="text-muted-foreground text-sm">
          DM Sans with Major Third ratio (1.25). Headings use tighter tracking for editorial feel.
        </p>
      </div>

      {/* Scale */}
      <div className="space-y-6 border rounded-lg p-6 bg-card">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground font-mono">text-4xl / 36px / bold / -0.03em</p>
          <h1 className="text-4xl font-bold" style={{ letterSpacing: '-0.03em' }}>
            Hero Heading
          </h1>
        </div>

        <div className="space-y-1 border-t pt-4">
          <p className="text-xs text-muted-foreground font-mono">text-3xl / 30px / semibold / -0.025em</p>
          <h2 className="text-3xl font-semibold" style={{ letterSpacing: '-0.025em' }}>
            Page Title
          </h2>
        </div>

        <div className="space-y-1 border-t pt-4">
          <p className="text-xs text-muted-foreground font-mono">text-2xl / 24px / semibold / -0.02em</p>
          <h3 className="text-2xl font-semibold" style={{ letterSpacing: '-0.02em' }}>
            Section Title
          </h3>
        </div>

        <div className="space-y-1 border-t pt-4">
          <p className="text-xs text-muted-foreground font-mono">text-xl / 20px / semibold / -0.01em</p>
          <h4 className="text-xl font-semibold" style={{ letterSpacing: '-0.01em' }}>
            Section Heading
          </h4>
        </div>

        <div className="space-y-1 border-t pt-4">
          <p className="text-xs text-muted-foreground font-mono">text-lg / 18px / medium</p>
          <p className="text-lg font-medium">Emphasized Body Text</p>
        </div>

        <div className="space-y-1 border-t pt-4">
          <p className="text-xs text-muted-foreground font-mono">text-base / 16px / regular</p>
          <p className="text-base">
            Body text. The quick brown fox jumps over the lazy dog. This is the default text size for paragraphs and
            general content in the application.
          </p>
        </div>

        <div className="space-y-1 border-t pt-4">
          <p className="text-xs text-muted-foreground font-mono">text-sm / 14px / regular</p>
          <p className="text-sm">Secondary text. Labels, descriptions, and supplementary information.</p>
        </div>

        <div className="space-y-1 border-t pt-4">
          <p className="text-xs text-muted-foreground font-mono">text-xs / 12px / regular</p>
          <p className="text-xs">Caption text. Metadata, timestamps, and fine print.</p>
        </div>
      </div>

      {/* Font Weights */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Font Weights</h3>
        <div className="space-y-2 border rounded-lg p-6 bg-card">
          <p className="font-normal">Regular (400) — Body text, descriptions</p>
          <p className="font-medium">Medium (500) — Labels, navigation items</p>
          <p className="font-semibold">Semibold (600) — Headings, emphasis</p>
          <p className="font-bold">Bold (700) — Hero headings only</p>
        </div>
      </div>

      {/* Color Combinations */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Text Color Hierarchy</h3>
        <div className="space-y-2 border rounded-lg p-6 bg-card">
          <p className="text-foreground font-semibold">Foreground — Primary content (headings, values)</p>
          <p className="text-foreground">Foreground — Body text</p>
          <p className="text-muted-foreground">Muted Foreground — Secondary text (labels, descriptions)</p>
          <p className="text-primary font-medium">Primary — Interactive text (links, emphasis)</p>
        </div>
      </div>
    </div>
  );
}

const meta: Meta = {
  title: 'Design System/Typography',
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj;

export const TypeScale: Story = {
  render: () => <TypeScaleSpecimen />,
};
