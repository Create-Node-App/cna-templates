import type { Meta, StoryObj } from '@storybook/react';

/**
 * # Elevation System
 *
 * Depth in Next.js SaaS AI Template comes from layered shadows, not gradient backgrounds.
 * Each level uses multiple shadow layers for realistic depth.
 *
 * Interactive cards transition from shadow-sm to shadow-md on hover.
 * This replaces the previous pattern of translateY + gradient glow.
 *
 * See docs/DESIGN_SYSTEM.md Section 6: Elevation and Depth
 */

const SHADOW_SCALE = [
  {
    name: 'shadow-xs',
    description: 'Subtle depth — inputs, small elements',
    value: '0 1px 2px rgba(0, 0, 0, 0.05)',
  },
  {
    name: 'shadow-sm',
    description: 'Default card depth — base state',
    value: '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)',
  },
  {
    name: 'shadow-md',
    description: 'Hovered cards, dropdowns',
    value: '0 4px 6px rgba(0, 0, 0, 0.06), 0 2px 4px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.03)',
  },
  {
    name: 'shadow-lg',
    description: 'Modals, popovers',
    value: '0 10px 15px rgba(0, 0, 0, 0.08), 0 4px 6px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.02)',
  },
  {
    name: 'shadow-xl',
    description: 'Floating panels',
    value: '0 20px 25px rgba(0, 0, 0, 0.08), 0 8px 10px rgba(0, 0, 0, 0.03)',
  },
];

function ElevationLadder() {
  return (
    <div className="space-y-8 p-6 max-w-3xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-1">Elevation Ladder</h2>
        <p className="text-muted-foreground text-sm mb-6">
          Layered shadows create premium depth. Each level adds visual weight. Cards use shadow-sm at rest, shadow-md on
          hover.
        </p>
      </div>

      <div className="space-y-6">
        {SHADOW_SCALE.map((level) => (
          <div key={level.name} className="flex items-start gap-4">
            <div
              className="w-48 h-24 rounded-lg border flex items-center justify-center"
              style={{
                boxShadow: level.value,
                backgroundColor: 'hsl(var(--card))',
                borderColor: 'hsl(var(--border))',
              }}
            >
              <span className="text-sm font-medium">{level.name}</span>
            </div>
            <div className="pt-2">
              <p className="text-sm font-medium">{level.name}</p>
              <p className="text-xs text-muted-foreground">{level.description}</p>
              <p className="text-[10px] text-muted-foreground font-mono mt-1 max-w-xs break-all">{level.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive demo */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Interactive Card Hover</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Hover over the cards below to see the elevation transition (shadow-sm → shadow-md).
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { name: 'Skills', color: 'oklch(55% 0.18 290)' },
            { name: 'OKRs', color: 'oklch(58% 0.17 155)' },
            { name: 'Learning', color: 'oklch(58% 0.15 230)' },
          ].map((domain) => (
            <div
              key={domain.name}
              className="rounded-lg p-4 cursor-pointer card-interactive"
              style={{
                backgroundColor: 'hsl(var(--card))',
                borderWidth: '1px',
                borderColor: 'hsl(var(--border))',
                borderLeftWidth: '3px',
                borderLeftColor: domain.color,
                boxShadow: SHADOW_SCALE[1].value,
              }}
            >
              <p className="text-sm font-semibold">{domain.name} Card</p>
              <p className="text-xs text-muted-foreground mt-1">Hover to see elevation change</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const meta: Meta = {
  title: 'Design System/Elevation',
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj;

export const Shadows: Story = {
  render: () => <ElevationLadder />,
};
