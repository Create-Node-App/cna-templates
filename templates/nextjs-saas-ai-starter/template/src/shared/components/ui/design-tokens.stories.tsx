import type { Meta, StoryObj } from '@storybook/react';

/**
 * # Design Tokens
 *
 * Visual reference for all design tokens in the Next.js SaaS AI Template design system.
 * These tokens are defined in `globals.css` (@theme block).
 *
 * See **docs/DESIGN_SYSTEM.md** for the full documentation of every token
 * and its rationale.
 *
 * ## Philosophy: "Intentional Craft"
 *
 * Every color has semantic meaning. Gradients are reserved for brand moments only.
 * Depth comes from elevation (shadows), not gradient backgrounds.
 */

/**
 * Color swatch using inline styles (direct CSS variable reference).
 * More reliable than Tailwind utility classes for documenting tokens.
 */
function ColorSwatch({
  name,
  cssVar,
  hslVar,
}: {
  name: string;
  cssVar: string;
  /** The CSS variable name (e.g. "--primary") used as hsl(var(...)) */
  hslVar: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="h-10 w-10 rounded-lg border border-black/10 shadow-sm shrink-0"
        style={{ backgroundColor: `hsl(var(${hslVar}))` }}
      />
      <div>
        <p className="text-sm font-medium">{name}</p>
        <p className="text-xs text-muted-foreground font-mono">{cssVar}</p>
      </div>
    </div>
  );
}

function DomainColorSwatch({
  name,
  cssVar,
  description,
  isOklch,
}: {
  name: string;
  cssVar: string;
  description: string;
  /** If true, variable is already a full color value (OKLCH), not HSL space-separated */
  isOklch?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="h-10 w-2 rounded-full shrink-0"
        style={{
          backgroundColor: isOklch ? `var(${cssVar})` : `hsl(var(${cssVar}))`,
        }}
      />
      <div>
        <p className="text-sm font-medium">{name}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

// --- Color Palette Story ---
function ColorPalette() {
  return (
    <div className="space-y-8 p-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-1">Color Palette</h2>
        <p className="text-muted-foreground text-sm mb-6">
          All colors use CSS custom properties for tenant customization. See Principle 1.2: &quot;Color Encodes
          Meaning&quot;.
        </p>
      </div>

      {/* Brand Colors */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Brand Colors (Tenant-Configurable)</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <ColorSwatch name="Primary" cssVar="--primary" hslVar="--primary" />
          <ColorSwatch name="Primary Foreground" cssVar="--primary-foreground" hslVar="--primary-foreground" />
          <ColorSwatch name="Secondary" cssVar="--secondary" hslVar="--secondary" />
          <ColorSwatch name="Secondary Foreground" cssVar="--secondary-foreground" hslVar="--secondary-foreground" />
          <ColorSwatch name="Ring / Focus" cssVar="--ring" hslVar="--ring" />
        </div>
      </div>

      {/* Neutral Colors */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Neutral Surfaces</h3>
        <p className="text-xs text-muted-foreground mb-3">
          Warm neutrals — intentionally subtle. Background and Card are near-white by design for a warm, editorial
          canvas.
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          <ColorSwatch name="Background" cssVar="--background" hslVar="--background" />
          <ColorSwatch name="Card" cssVar="--card" hslVar="--card" />
          <ColorSwatch name="Muted" cssVar="--muted" hslVar="--muted" />
          <ColorSwatch name="Accent" cssVar="--accent" hslVar="--accent" />
          <ColorSwatch name="Border" cssVar="--border" hslVar="--border" />
          <ColorSwatch name="Popover" cssVar="--popover" hslVar="--popover" />
          <ColorSwatch name="Foreground" cssVar="--foreground" hslVar="--foreground" />
          <ColorSwatch name="Muted Foreground" cssVar="--muted-foreground" hslVar="--muted-foreground" />
        </div>
      </div>

      {/* Text Colors */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Text Colors</h3>
        <div className="space-y-2 rounded-lg border p-4" style={{ backgroundColor: 'hsl(var(--card))' }}>
          <p style={{ color: 'hsl(var(--foreground))' }} className="font-medium">
            Foreground — primary text
          </p>
          <p style={{ color: 'hsl(var(--muted-foreground))' }}>Muted Foreground — secondary text</p>
          <p style={{ color: 'hsl(var(--primary))' }} className="font-medium">
            Primary — links and emphasis
          </p>
          <p style={{ color: 'hsl(var(--secondary))' }}>Secondary — secondary emphasis</p>
        </div>
      </div>

      {/* Domain Colors */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Domain Colors (Fixed)</h3>
        <p className="text-sm text-muted-foreground mb-3">
          These appear as 3px left accent bars on domain cards. Not tenant-configurable.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <DomainColorSwatch name="Skills" cssVar="--color-skill" description="Violet — creativity, mastery" isOklch />
          <DomainColorSwatch
            name="Interests"
            cssVar="--color-interest"
            description="Amber — warmth, curiosity"
            isOklch
          />
          <DomainColorSwatch name="OKRs" cssVar="--domain-okr" description="Emerald — growth, achievement" />
          <DomainColorSwatch name="Learning" cssVar="--domain-learning" description="Blue — knowledge, trust" />
          <DomainColorSwatch name="Performance" cssVar="--domain-performance" description="Orange — action, momentum" />
          <DomainColorSwatch name="Projects" cssVar="--domain-project" description="Indigo — structure, planning" />
          <DomainColorSwatch
            name="Recognition"
            cssVar="--domain-recognition"
            description="Rose — appreciation, warmth"
          />
          <DomainColorSwatch name="One-on-One" cssVar="--domain-oneonone" description="Teal — connection, dialogue" />
        </div>
      </div>

      {/* Status Colors */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Status Colors</h3>
        <div className="grid gap-4 sm:grid-cols-4">
          <ColorSwatch name="Success" cssVar="--success" hslVar="--success" />
          <ColorSwatch name="Warning" cssVar="--warning" hslVar="--warning" />
          <ColorSwatch name="Destructive" cssVar="--destructive" hslVar="--destructive" />
          <ColorSwatch name="Info" cssVar="--info" hslVar="--info" />
        </div>
      </div>

      {/* Surface Tints */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Surface Tints (Domain Backgrounds)</h3>
        <p className="text-sm text-muted-foreground mb-3">Subtle background tints for domain-specific card sections.</p>
        <div className="grid gap-3 sm:grid-cols-4">
          {[
            { name: 'Skill', v: '--surface-skill' },
            { name: 'Interest', v: '--surface-interest' },
            { name: 'OKR', v: '--surface-okr' },
            { name: 'Learning', v: '--surface-learning' },
            { name: 'Performance', v: '--surface-performance' },
            { name: 'Project', v: '--surface-project' },
            { name: 'Recognition', v: '--surface-recognition' },
            { name: 'One-on-One', v: '--surface-oneonone' },
          ].map((s) => (
            <div key={s.v} className="flex items-center gap-2">
              <div
                className="h-8 w-8 rounded-md border border-black/10 shrink-0"
                style={{ backgroundColor: `hsl(var(${s.v}))` }}
              />
              <div>
                <p className="text-xs font-medium">{s.name}</p>
                <p className="text-[10px] text-muted-foreground font-mono">{s.v}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Brand Gradient */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Brand Gradient (The ONE Gradient)</h3>
        <p className="text-sm text-muted-foreground mb-3">
          Reserved for logo mark and hero sections only. See Section 8.4 of DESIGN_SYSTEM.md: &quot;The Brand
          Moment&quot;.
        </p>
        <div className="h-12 rounded-lg brand-gradient shadow-sm" />
        <p className="text-xs text-muted-foreground mt-2 font-mono">
          linear-gradient(135deg, hsl(var(--brand-gradient-from)), hsl(var(--brand-gradient-to)))
        </p>
      </div>
    </div>
  );
}

const meta: Meta = {
  title: 'Design System/Color Palette',
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj;

export const Colors: Story = {
  render: () => <ColorPalette />,
};
