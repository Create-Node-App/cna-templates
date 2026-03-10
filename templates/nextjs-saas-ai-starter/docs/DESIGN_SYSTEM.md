# Next.js SaaS AI Template Design System

> **Philosophy: "Intentional Craft"** — Every visual choice has a documented reason. When someone asks _"why does it look like this?"_, there is an answer grounded in UX research and design principles.

---

## Table of Contents

1. [Design Principles](#1-design-principles)
2. [Standards and References](#2-standards-and-references)
3. [Color System](#3-color-system)
4. [Typography](#4-typography)
5. [Spacing and Layout](#5-spacing-and-layout)
6. [Elevation and Depth](#6-elevation-and-depth)
7. [Motion and Animation](#7-motion-and-animation)
8. [Visual Signature](#8-visual-signature)
9. [Component Patterns](#9-component-patterns)
10. [Tenant Branding](#10-tenant-branding)
11. [Anti-Patterns](#11-anti-patterns)
12. [Accessibility](#12-accessibility)

---

## 1. Design Principles

These five principles guide every design decision in Next.js SaaS AI Template. They follow the documentation pattern established by Lattice, Atlassian, and Intercom — serving as shared vocabulary that short-circuits debate and focuses creative energy.

### 1.1 Clarity Builds Confidence

**Origin:** Lattice's "Build Confidence with Clarity" + Nielsen's Heuristic #1 (Visibility of System Status).

**Why it matters:** Users in Next.js SaaS AI Template make high-visibility decisions about their teams — requesting assessments, assigning learning paths, setting OKRs. If they are unsure about what data they are seeing or what happens when they click, they will not act.

**Tactics:**

- Clear labels on every data display — never assume the user knows the context
- Explicit status indicators (draft, submitted, approved) with consistent iconography
- Confirmation dialogs for impactful actions with clear explanation of consequences
- Visible breadcrumbs showing where the user is in the application hierarchy
- Transparent data scope — make it obvious whose data the user is viewing (their own, their team's, the organization's)

**Anti-pattern:** Decorative elements that compete with information hierarchy.

### 1.2 Color Encodes Meaning

**Origin:** Atlassian's color role system + Material Design 3's color roles.

**Why it matters:** Color is not decoration — it is a language. Each domain in Next.js SaaS AI Template (skills, OKRs, learning, performance, projects, recognition, 1:1s) has a dedicated color that users learn to recognize. This reduces cognitive load: users can scan a page and immediately identify what domain each card or section belongs to.

**Tactics:**

- Domain-coded accent bars on cards (3px left border) — the primary visual signature
- Consistent color association: violet = skills, emerald = OKRs, blue = learning, orange = performance, etc.
- Semantic status colors: green = success, amber = warning, red = destructive, blue = info
- Primary color is reserved for interactive elements (buttons, links, focus rings) and brand identity

**Anti-pattern:** Gradients used for decoration, color applied without semantic meaning, multiple accent colors in a single card.

### 1.3 Selective Emphasis Creates Hierarchy

**Origin:** Linear's "reduce visual noise while increasing hierarchy density" + Von Restorff effect (distinct items stand out in memory).

**Why it matters:** When everything is visually loud, nothing stands out. AI-generated UIs fail here by applying gradients, shadows, and color to every element equally. Professional UIs reserve visual emphasis for the most important element in each viewport.

**Tactics:**

- One "hero" element per page (the page header or a key metric)
- Solid primary-color buttons for primary actions — the ONLY strongly-colored interactive element
- Subtle surfaces for secondary content (muted backgrounds, reduced opacity)
- Progressive disclosure — show summary first, detail on interaction
- Only ONE gradient in the entire app: the brand gradient, reserved for the logo mark and hero banners

**Anti-pattern:** Gradients on buttons AND cards AND headers simultaneously. Every card having the same visual weight.

### 1.4 Guide, Don't Overwhelm

**Origin:** Lattice's "Be a Coach" + Hick's Law (decision time increases with the number and complexity of choices).

**Why it matters:** Users are experts at their day jobs, not at navigating complex HR platforms. Companies are at varying levels of maturity in their talent processes. The interface should meet users where they are.

**Tactics:**

- Empty state storytelling — turn "No data" into guidance ("Start by uploading your CV" with a clear CTA)
- Progress indicators for multi-step workflows (show steps completed and remaining)
- Contextual tooltips that explain what a feature does and why it matters
- Templates and smart defaults for complex setup flows
- Limit primary CTAs to 1-2 per viewport (Hick's Law)

**Anti-pattern:** Dense dashboards without guidance, actions without explanatory context, too many options at once.

### 1.5 Celebrate What Matters

**Origin:** Lattice's "Celebrate Moments that Matter" + the aesthetic-usability effect (attractive interfaces are perceived as more usable).

**Why it matters:** Next.js SaaS AI Template's mission is to help make work meaningful. Micro-celebrations at meaningful moments make the platform feel alive without being noisy. They remind users of progress and reinforce positive behaviors.

**Tactics:**

- Subtle success animations for milestone completions (assessment done, growth path achieved)
- Match celebration intensity to effort (a small check animation for a quick action, a more visible celebration for completing a full assessment cycle)
- Encouraging copy in success states ("Great progress!" rather than "Action completed")
- Progress completion indicators that feel rewarding

**Anti-pattern:** Generic toast notifications for everything, identical feedback for trivial and significant actions.

---

## 2. Standards and References

Every design decision in this system maps to an established standard:

| Decision Area             | Standard/Reference                  | How We Apply It                                                                |
| ------------------------- | ----------------------------------- | ------------------------------------------------------------------------------ |
| Usability heuristics      | Nielsen's 10 Heuristics (NN/g)      | Principles 1.1, 1.3, 1.4                                                       |
| Color system architecture | Material Design 3 Color Roles       | 3-accent-layer model (primary, secondary, accent) with surface tonal elevation |
| Design token naming       | Atlassian Design Tokens             | Semantic naming: Foundation + Property + Modifier                              |
| Color scale methodology   | Radix Colors 12-step system         | 12-step palette with guaranteed contrast ratios                                |
| Color space               | OKLCH (perceptually uniform)        | All colors defined in OKLCH for consistent palette generation                  |
| Product design principles | Lattice Design Principles           | Adapted for Next.js SaaS AI Template's specific domain                         |
| Visual refinement         | Linear UI Approach                  | "Reduce visual noise while increasing hierarchy density"                       |
| HR platform UX            | HR Portal UX Research               | Task-centered interfaces, role-based dashboards, 80/20 feature prominence      |
| Typography                | Major Third type scale (1.25 ratio) | Proven ratio for information-dense interfaces                                  |
| Accessibility             | WCAG 2.1 AA                         | Minimum 4.5:1 text contrast, 3:1 for UI elements                               |

---

## 3. Color System

### 3.1 Why OKLCH

All colors are defined in the OKLCH color space (Lightness, Chroma, Hue). OKLCH is perceptually uniform: a numerical change in lightness produces a proportional perceived brightness change. This enables:

- **Palette generation from a seed color** — tenants set one hex color, we generate a full harmonious palette
- **Consistent dark mode derivation** — light/dark pairs maintain the same perceived relationship
- **Predictable contrast ratios** — accessibility compliance becomes systematic, not manual
- **Cross-hue consistency** — a violet and an emerald at the same OKLCH lightness look equally prominent

### 3.2 Palette Structure

#### Neutrals

Warm gray with a slight blue undertone (hue ~260). The warmth prevents the clinical feel of pure gray while the blue undertone keeps it professional.

| Step | OKLCH Value            | Usage (Light Mode)      | Usage (Dark Mode) |
| ---- | ---------------------- | ----------------------- | ----------------- |
| 1    | `oklch(99% 0.003 260)` | Page background         | —                 |
| 2    | `oklch(97% 0.005 260)` | Card background         | —                 |
| 3    | `oklch(94% 0.008 260)` | Muted/subtle background | —                 |
| 4    | `oklch(90% 0.010 260)` | Borders                 | —                 |
| 5    | `oklch(80% 0.010 260)` | —                       | Muted foreground  |
| 6    | `oklch(55% 0.010 260)` | Secondary text          | Secondary text    |
| 7    | `oklch(40% 0.012 260)` | Primary text            | —                 |
| 8    | `oklch(25% 0.015 260)` | Heading text            | —                 |
| 9    | `oklch(18% 0.015 260)` | —                       | Card background   |
| 10   | `oklch(14% 0.012 260)` | —                       | Page background   |
| 11   | `oklch(10% 0.010 260)` | —                       | Deepest surface   |
| 12   | `oklch(06% 0.008 260)` | —                       | True dark         |

#### Primary Color (Tenant-Configurable)

Default: Indigo at hue ~260. The `ThemeCSSInjector` component generates a 12-step palette from the tenant's configured hex color using `culori`.

Mapped to: `--primary`, `--primary-foreground`, `--ring`, active states, links, focus rings.

#### Secondary Color (Tenant-Configurable)

Default: Violet at hue ~290. Used sparingly for secondary actions and decorative accents.

#### Accent Color (Tenant-Configurable)

Default: Teal at hue ~175. Used for tertiary highlights and brand differentiation.

#### Domain Colors (Fixed)

These are NOT tenant-configurable. They form a consistent visual language across all tenants.

| Domain      | OKLCH Value           | Hex Approx. | Rationale                         |
| ----------- | --------------------- | ----------- | --------------------------------- |
| Skill       | `oklch(55% 0.18 290)` | Violet      | Creativity, expertise, mastery    |
| Interest    | `oklch(70% 0.16 75)`  | Amber       | Warmth, curiosity, energy         |
| OKR         | `oklch(58% 0.17 155)` | Emerald     | Growth, progress, achievement     |
| Learning    | `oklch(58% 0.15 230)` | Blue        | Knowledge, depth, trust           |
| Performance | `oklch(65% 0.17 55)`  | Orange      | Action, momentum, evaluation      |
| Project     | `oklch(55% 0.17 265)` | Indigo      | Structure, planning, organization |
| Recognition | `oklch(62% 0.19 15)`  | Rose        | Appreciation, warmth, celebration |
| One-on-One  | `oklch(58% 0.14 175)` | Teal        | Connection, dialogue, support     |

#### Status Colors (Fixed)

| Status      | OKLCH Value           | Usage                              |
| ----------- | --------------------- | ---------------------------------- |
| Success     | `oklch(62% 0.17 150)` | Completed actions, positive states |
| Warning     | `oklch(75% 0.16 75)`  | Requires attention, pending review |
| Destructive | `oklch(58% 0.22 25)`  | Errors, deletions, critical alerts |
| Info        | `oklch(62% 0.14 240)` | Informational messages, tips       |

### 3.3 Color Usage Rules

1. **Primary color** is for interactive elements: buttons, links, focus rings, active nav items
2. **Domain colors** appear only in accent bars (3px left border) and subtle background tints (10% opacity)
3. **Status colors** are for feedback: alerts, badges, status indicators
4. **Neutrals** form the canvas: backgrounds, text, borders, dividers
5. **Never use color without semantic meaning** — if a color does not communicate domain, status, or interaction, it should be neutral

---

## 4. Typography

### 4.1 Font Selection

**Primary font: DM Sans** — A geometric sans-serif that is modern, friendly, and highly readable. Chosen over Inter (overused in AI-generated UIs) and Open Sans (the previous font, less distinctive).

DM Sans is used for both body text and headings. Differentiation comes from weight and letter-spacing, not from mixing font families. This creates cohesion while allowing clear hierarchy.

### 4.2 Type Scale

Based on a Major Third ratio (1.25), which is proven effective for information-dense interfaces like dashboards and admin panels.

| Token       | Size            | Line Height | Weight | Tracking | Usage                  |
| ----------- | --------------- | ----------- | ------ | -------- | ---------------------- |
| `text-xs`   | 0.75rem (12px)  | 1rem        | 400    | normal   | Captions, metadata     |
| `text-sm`   | 0.875rem (14px) | 1.25rem     | 400    | normal   | Secondary text, labels |
| `text-base` | 1rem (16px)     | 1.5rem      | 400    | normal   | Body text              |
| `text-lg`   | 1.125rem (18px) | 1.75rem     | 500    | normal   | Emphasized body        |
| `text-xl`   | 1.25rem (20px)  | 1.75rem     | 600    | -0.01em  | Section headings       |
| `text-2xl`  | 1.5rem (24px)   | 2rem        | 600    | -0.02em  | Page section titles    |
| `text-3xl`  | 1.875rem (30px) | 2.25rem     | 600    | -0.025em | Page titles            |
| `text-4xl`  | 2.25rem (36px)  | 2.5rem      | 700    | -0.03em  | Hero headings          |

### 4.3 Typography Rules

1. **Headings** use semibold (600) or bold (700) with tighter letter-spacing — this creates the "editorial" feel that distinguishes premium UIs
2. **Body text** uses regular (400) with standard tracking for maximum readability
3. **Labels and nav items** use medium (500)
4. **Never use more than 3 font weights on a single page**
5. **Line lengths** should stay between 45-75 characters for body text (use `max-w-prose` or container constraints)

---

## 5. Spacing and Layout

### 5.1 Spacing Scale

Based on Tailwind's 4px base unit. Consistent spacing creates visual rhythm.

Preferred values: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80 (px)

### 5.2 Layout Structure

```
Desktop:
┌──────────────────────────────────────────┐
│ TopHeader (sticky, 56px)                 │
├──────────┬───────────────────────────────┤
│ Sidebar  │ Main Content                  │
│ (64px or │ (max-w container, centered)   │
│  16px    │                               │
│ collapsed│ ┌───────────────────────────┐  │
│          │ │ PageHeader               │  │
│          │ ├───────────────────────────┤  │
│          │ │ Content area             │  │
│          │ │ (padding: 24px)          │  │
│          │ └───────────────────────────┘  │
└──────────┴───────────────────────────────┘
```

### 5.3 Border Radius

Tenant-configurable via the `--radius` CSS variable. The default (10px / `0.625rem`) is friendly without being bubbly.

| Token         | Calculation           | Default Value | Usage                          |
| ------------- | --------------------- | ------------- | ------------------------------ |
| `--radius-sm` | `var(--radius) - 4px` | 6px           | Small elements (badges, chips) |
| `--radius-md` | `var(--radius)`       | 10px          | Default (inputs, buttons)      |
| `--radius-lg` | `var(--radius) + 4px` | 14px          | Cards, dialogs                 |
| `--radius-xl` | `var(--radius) + 8px` | 18px          | Large containers, modals       |

---

## 6. Elevation and Depth

Depth in Next.js SaaS AI Template comes from **layered shadows** (elevation), not from gradient backgrounds. This is a key differentiator from AI-generated UIs.

### 6.1 Shadow Scale

Each level uses multiple shadow layers for realism. The subtle 1px border-shadow at `md` and `lg` adds crispness.

| Token       | CSS Value                                                                                          | Usage                    |
| ----------- | -------------------------------------------------------------------------------------------------- | ------------------------ |
| `shadow-xs` | `0 1px 2px oklch(0% 0 0 / 0.05)`                                                                   | Subtle depth (inputs)    |
| `shadow-sm` | `0 1px 3px oklch(0% 0 0 / 0.08), 0 1px 2px oklch(0% 0 0 / 0.04)`                                   | Default card depth       |
| `shadow-md` | `0 4px 6px oklch(0% 0 0 / 0.06), 0 2px 4px oklch(0% 0 0 / 0.04), 0 0 0 1px oklch(0% 0 0 / 0.03)`   | Hovered cards, dropdowns |
| `shadow-lg` | `0 10px 15px oklch(0% 0 0 / 0.08), 0 4px 6px oklch(0% 0 0 / 0.04), 0 0 0 1px oklch(0% 0 0 / 0.02)` | Modals, popovers         |
| `shadow-xl` | `0 20px 25px oklch(0% 0 0 / 0.08), 0 8px 10px oklch(0% 0 0 / 0.03)`                                | Floating panels          |

### 6.2 Hover Elevation

Interactive cards transition from `shadow-sm` to `shadow-md` on hover. This replaces the previous pattern of `translate-y` + gradient glow, which felt artificial.

```css
.card-interactive {
  box-shadow: var(--shadow-sm);
  transition: box-shadow var(--duration-normal) var(--ease-out);
}
.card-interactive:hover {
  box-shadow: var(--shadow-md);
}
```

---

## 7. Motion and Animation

### 7.1 Timing Tokens

| Token               | Value | Usage                          |
| ------------------- | ----- | ------------------------------ |
| `--duration-fast`   | 100ms | Color changes, opacity         |
| `--duration-normal` | 200ms | Shadow transitions, transforms |
| `--duration-slow`   | 350ms | Page transitions, celebrations |

### 7.2 Easing Functions

| Token           | Value                                  | Usage                                |
| --------------- | -------------------------------------- | ------------------------------------ |
| `--ease-out`    | `cubic-bezier(0.25, 0.46, 0.45, 0.94)` | Standard exit transitions            |
| `--ease-in-out` | `cubic-bezier(0.45, 0, 0.55, 1)`       | Standard bidirectional               |
| `--ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)`    | Celebration moments, bouncy feedback |

### 7.3 Motion Principles

1. **Purpose over decoration** — every animation should solve a UX problem (provide feedback, show state change, guide attention)
2. **Duration matches importance** — fast for micro-interactions (100ms), normal for state changes (200ms), slow for celebrations (350ms)
3. **Respect user preferences** — all animations are disabled when `prefers-reduced-motion: reduce` is set
4. **Consistency** — the same type of transition uses the same timing and easing everywhere

### 7.4 Standard Patterns

| Pattern      | Implementation                             | When to Use                          |
| ------------ | ------------------------------------------ | ------------------------------------ |
| Button press | `active:scale-[0.98]`                      | All buttons — tactile click feedback |
| Card hover   | `shadow-sm -> shadow-md` transition        | Interactive cards                    |
| Focus ring   | `ring-2 ring-ring ring-offset-2`           | All focusable elements               |
| Entrance     | `opacity 0->1, translateY 8px->0` at 200ms | Page content on mount                |
| Celebration  | `ease-spring` with scale animation         | Milestone completions                |
| Loading      | Neutral-color skeleton shimmer             | Content loading states               |

---

## 8. Visual Signature

These five elements define Next.js SaaS AI Template's visual identity. They replace the previous "gradients everywhere" approach.

### 8.1 The Domain Accent Bar

A consistent 3px left border on cards that communicates domain at a glance. This is the PRIMARY visual signature of Next.js SaaS AI Template.

```
Skills card       → 3px violet left border
OKR card          → 3px emerald left border
Learning card     → 3px blue left border
Performance card  → 3px orange left border
Project card      → 3px indigo left border
Recognition card  → 3px rose left border
1:1 card          → 3px teal left border
```

### 8.2 Premium Elevation

Cards float above the surface with layered shadows. Hover states increase elevation. This provides depth and interactivity feedback without resorting to gradient backgrounds.

### 8.3 The Primary Action

Primary buttons are solid `bg-primary` with no gradient. They are the ONLY strongly colored interactive elements in a given view (besides accent bars). This creates clear visual hierarchy.

### 8.4 The Brand Moment

ONE gradient exists in the entire application: the brand gradient (primary -> secondary). It appears ONLY on:

- The Next.js SaaS AI Template logo mark
- The hero banner at the top of the dashboard
- The landing page hero section

This scarcity makes the gradient feel intentional and premium. Every other surface uses solid colors.

### 8.5 Warm Neutral Canvas

A slightly warm neutral background (OKLCH with low chroma at hue ~260) that feels human and editorial. Not pure white (clinical), not pure gray (cold).

---

## 9. Component Patterns

### 9.1 Cards

- **Base**: `rounded-lg border border-border bg-card shadow-sm`
- **With domain accent**: Add `border-l-[3px] border-l-{domain-color}`
- **Interactive**: Add `transition-shadow hover:shadow-md cursor-pointer`
- **Never**: Gradient backgrounds on cards

### 9.2 Buttons

- **Primary**: `bg-primary text-primary-foreground` — solid, no gradient
- **Secondary**: `bg-secondary text-secondary-foreground`
- **Ghost**: `hover:bg-accent` — for toolbar/nav actions
- **All buttons**: `active:scale-[0.98]` for tactile feedback, `focus-visible:ring-2 ring-ring ring-offset-2` for accessibility

### 9.3 Page Headers

- **Hero variant**: Solid `bg-primary` with optional subtle radial gradient overlay. White text. No animated blur blobs.
- **Compact variant**: Card-style with optional domain accent border. Used for sub-pages.

### 9.4 Progress Indicators

- Use solid domain colors, not gradients
- Skills progress: violet bar
- OKR progress: emerald bar
- Default: primary color bar

### 9.5 Stat Cards

- Clean card with domain accent bar + shadow elevation
- Icon in a subtle domain-color circle (10% opacity background)
- No gradient top bars, no gradient backgrounds

---

## 10. Tenant Branding

### 10.1 Configurable Properties

Admins can customize these properties per tenant via Settings > Branding:

| Property        | Type                           | Default   | Effect                                            |
| --------------- | ------------------------------ | --------- | ------------------------------------------------- |
| Primary Color   | Hex                            | `#4F5BD5` | Buttons, links, focus rings, brand gradient start |
| Secondary Color | Hex                            | `#7C6EAF` | Secondary actions, brand gradient end             |
| Accent Color    | Hex                            | `#2BA8A4` | Tertiary highlights                               |
| Neutral Warmth  | cool/neutral/warm              | warm      | Background hue undertone                          |
| Surface Style   | flat/elevated/glass            | elevated  | Card depth treatment                              |
| Border Radius   | none/sm/md/lg/xl               | lg        | Corner rounding scale                             |
| Font Family     | dm-sans/inter/open-sans/system | dm-sans   | Typography                                        |
| Density         | compact/default/comfortable    | default   | Spacing multiplier                                |
| Brand Gradient  | on/off                         | on        | Whether the brand gradient is used                |
| Logo URL        | URL                            | —         | Custom logo image                                 |
| Favicon URL     | URL                            | —         | Custom browser favicon                            |
| Display Name    | String                         | —         | Override for tenant name                          |

### 10.2 How It Works

The `ThemeCSSInjector` client component:

1. Reads tenant UI settings from the `TenantProvider` context
2. Converts hex colors to OKLCH using the `culori` library
3. Generates a 12-step palette for primary, secondary, and accent colors
4. Injects CSS custom properties onto `document.documentElement`
5. Re-computes when the user toggles light/dark mode

### 10.3 Theme Presets

Pre-configured theme combinations available in the admin UI:

- **Default** — Indigo primary, violet secondary, teal accent, warm neutrals
- **Corporate Blue** — Navy primary, slate secondary, sky accent, cool neutrals
- **Modern Green** — Emerald primary, forest secondary, lime accent, neutral
- **Warm Sunset** — Coral primary, amber secondary, gold accent, warm neutrals
- **Monochrome** — Slate primary, gray secondary, gray accent, neutral

---

## 11. Anti-Patterns

These patterns are explicitly prohibited in Next.js SaaS AI Template. They are documented here so that contributors (human or AI) know what to avoid.

### 11.1 Gradient Abuse

**Don't:** Apply gradients to buttons, card backgrounds, progress bars, icon containers, or any element besides the designated brand moments (logo mark and hero banner).

**Why:** Uniform gradient application is the #1 indicator of AI-generated UI. It removes visual hierarchy and makes every element compete for attention.

### 11.2 Decorative Blur Blobs

**Don't:** Use large (>100px) blurred gradient circles as background decoration.

**Why:** This is a V0/Cursor default pattern that immediately signals "AI-generated." It adds visual noise without information value.

### 11.3 Hardcoded Colors

**Don't:** Use inline hex values (`from-[#5D73F5]`). Always reference design tokens (`bg-primary`, `text-muted-foreground`).

**Why:** Hardcoded colors bypass the theme system, break tenant customization, and make the palette ungovernable.

### 11.4 Everything is Emphasized

**Don't:** Apply strong visual treatment (gradients, large shadows, bright colors) to multiple elements simultaneously.

**Why:** Violates Principle 1.3 (Selective Emphasis). When everything is special, nothing is.

### 11.5 Invalid CSS Classes

**Don't:** Use `bg-linear-to-r` (invalid in Tailwind). Use `bg-gradient-to-r` or preferably solid colors.

---

## 12. Accessibility

### 12.1 Color Contrast

- **Text**: Minimum 4.5:1 contrast ratio against background (WCAG AA)
- **Large text** (18px+ or 14px+ bold): Minimum 3:1
- **UI components**: Minimum 3:1 for borders, icons, focus indicators

### 12.2 Focus Management

- All interactive elements have visible focus indicators: `ring-2 ring-ring ring-offset-2 ring-offset-background`
- Focus order follows logical reading order
- Skip links for keyboard navigation

### 12.3 Motion Preferences

- All animations respect `prefers-reduced-motion: reduce`
- Essential state changes remain visible without animation (opacity/visibility, not just animation)

### 12.4 Semantic HTML

- Use proper heading hierarchy (h1 -> h2 -> h3, no skipping)
- ARIA labels on icon-only buttons
- Role attributes on custom interactive elements

---

_This document is the source of truth for Next.js SaaS AI Template's design system. For component-level implementation details, see [COMPONENTS_AND_STYLING.md](./COMPONENTS_AND_STYLING.md) and [SHADCN_AND_COMPONENTS.md](./SHADCN_AND_COMPONENTS.md). For brand assets and logo usage, see [BRAND_GUIDELINES.md](./BRAND_GUIDELINES.md)._
