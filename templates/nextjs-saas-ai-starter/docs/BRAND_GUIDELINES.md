# Next.js SaaS AI Template — Brand Guidelines

> This document defines the visual identity defaults of the Next.js SaaS AI Template. Tenants can customize brand colors and logos via admin settings. For design tokens, principles, and component patterns, see [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md).

---

## 1. Logo

### 1.1 Primary Logo

The template logo consists of two elements:

- **Logo mark**: A rounded square with the brand gradient (primary → secondary) containing a bold white initial character
- **Wordmark**: Application name in bold with the brand gradient text treatment

### 1.2 Logo Sizes

| Size          | Mark    | Text | Usage                       |
| ------------- | ------- | ---- | --------------------------- |
| Small (`sm`)  | 28×28px | 16px | Collapsed sidebar, favicons |
| Medium (`md`) | 32×32px | 18px | Default header, navigation  |
| Large (`lg`)  | 40×40px | 24px | Landing page, marketing     |

### 1.3 Logo Clear Space

Maintain a minimum clear space equal to the height of the logo mark on all sides.

### 1.4 Logo Usage Rules

- **Do**: Use the logo on light backgrounds (white, off-white, light gray)
- **Do**: Use the logo on dark backgrounds (the gradient remains visible)
- **Do**: Use the tenant's custom logo URL when configured via admin settings
- **Don't**: Place the logo on busy backgrounds or images without a backdrop
- **Don't**: Stretch, rotate, or distort the logo
- **Don't**: Change the gradient colors outside of the admin branding settings

### 1.5 Tenant Custom Logos

When a tenant configures a `logoUrl` in admin settings, the custom image replaces the default logo mark. The wordmark remains unchanged. Custom logos should:

- Be square or near-square (1:1 aspect ratio recommended)
- Have a transparent background (PNG or SVG)
- Be at least 128×128px for crisp rendering at all sizes

---

## 2. Color Palette

### 2.1 Brand Colors (Tenant-Configurable)

| Role          | Default Hex | Default HSL   | Usage                                             |
| ------------- | ----------- | ------------- | ------------------------------------------------- |
| **Primary**   | `#4F5BD5`   | `245 58% 52%` | Buttons, links, focus rings, brand gradient start |
| **Secondary** | `#7C6EAF`   | `270 30% 58%` | Secondary actions, brand gradient end             |
| **Accent**    | `#2BA8A4`   | `175 55% 40%` | Tertiary highlights, differentiation              |

These defaults are overridable per-tenant through admin settings.

### 2.2 Status Colors

| Status      | Color                       | Usage                         |
| ----------- | --------------------------- | ----------------------------- |
| Success     | Green `oklch(62% 0.17 150)` | Completed, approved, positive |
| Warning     | Amber `oklch(75% 0.16 75)`  | Needs attention, pending      |
| Destructive | Red `oklch(58% 0.22 25)`    | Errors, deletions, critical   |
| Info        | Blue `oklch(62% 0.14 240)`  | Informational, tips           |

### 2.3 Neutral Palette

Warm gray with a slight blue undertone (hue ~260). See [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) Section 3.2 for the full 12-step scale.

---

## 3. Typography

### 3.1 Font

**DM Sans** — A geometric sans-serif from Google Fonts. Modern, friendly, highly readable.

Weights used: Regular (400), Medium (500), Semibold (600), Bold (700).

### 3.2 Heading Style

Headings use **semibold (600)** weight with **negative letter-spacing** (`-0.02em` to `-0.03em`). This creates a tight, editorial feel that distinguishes the UI from generic interfaces.

```
h1: 2.25rem / bold / -0.03em tracking
h2: 1.875rem / semibold / -0.025em tracking
h3: 1.5rem / semibold / -0.02em tracking
```

### 3.3 Body Text

Body text uses **regular (400)** weight with standard letter-spacing for maximum readability.

---

## 4. The Brand Gradient

The brand gradient flows from primary to secondary color.

```css
background: linear-gradient(135deg, hsl(var(--brand-gradient-from)), hsl(var(--brand-gradient-to)));
```

### 4.1 Where It Appears

| Location                     | Implementation                                     |
| ---------------------------- | -------------------------------------------------- |
| Logo mark                    | `.brand-gradient` class on the logo container      |
| Dashboard hero banner        | `PageHeader variant="hero"` uses `.brand-gradient` |
| Sidebar/header accent stripe | `.brand-gradient` on 0.5px top stripe              |

### 4.2 Where It Does NOT Appear

- Buttons (use solid `bg-primary`)
- Card backgrounds (use elevation/shadow)
- Progress bars (use solid domain colors)
- Icon containers (use solid domain-color circles at 10% opacity)
- Any decorative element

This scarcity is deliberate: it makes the gradient feel premium and intentional rather than generic.

---

## 5. Visual Signature Summary

| Element                  | Description                        | Where               |
| ------------------------ | ---------------------------------- | ------------------- |
| **Domain Accent Bar**    | 3px colored left border on cards   | Every domain card   |
| **Premium Elevation**    | Layered shadows, hover transitions | Cards, dropdowns    |
| **Solid Primary Action** | `bg-primary` buttons, no gradient  | All primary buttons |
| **The Brand Moment**     | Primary→secondary gradient         | Logo + hero only    |
| **Warm Neutral Canvas**  | Slightly warm off-white background | Page backgrounds    |

---

## 6. Do's and Don'ts

### Do

- Use domain accent bars to communicate card type at a glance
- Use solid `bg-primary` for primary actions
- Use elevation (shadows) for depth and interactivity
- Use the brand gradient ONLY on the logo mark and hero sections
- Reference design tokens (`bg-primary`, `text-muted-foreground`) — never hardcode hex
- Check contrast ratios (4.5:1 for text, 3:1 for UI elements)

### Don't

- Apply gradients to buttons, cards, progress bars, or icons
- Use decorative blur blobs as background decoration
- Hardcode hex colors (e.g., `from-[#5D73F5]`) — use semantic tokens
- Emphasize everything simultaneously — reserve emphasis for the most important element
- Use the invalid `bg-linear-to-r` Tailwind class — use `bg-gradient-to-r` or solid colors
- Mix color spaces (use HSL for CSS variables, OKLCH for domain/assessment colors)

---

_For implementation details and design token reference, see [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md). For component-level patterns, see [COMPONENTS_AND_STYLING.md](./COMPONENTS_AND_STYLING.md)._
