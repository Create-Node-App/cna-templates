---
title: Branding & Customization
description: Customize your Next.js SaaS AI Template tenant with colors, typography, density, surface styles, and other visual settings.
section: admin
order: 2
---

# Branding & Customization

Next.js SaaS AI Template is highly customizable to match your organization's visual identity and design preferences. This guide walks through the branding settings available to admins.

---

## Where to Find Branding Settings

1. Sign in as an **Admin** and go to the **Admin View**
2. In the sidebar, select **Settings**
3. Click the **Branding** tab (or similar)
4. Make your changes and **Save**

All changes apply immediately to your tenant across all users and devices.

---

## Customizable Branding Elements

### Colors

Customize the three primary colors that define your brand in Next.js SaaS AI Template:

#### Primary Color

- **What it is:** The main brand color used for primary buttons, links, accents, and highlights.
- **Default:** Vibrant blue (`#3B82F6`)
- **Tips:**
  - Choose a color with good contrast against white and your chosen neutral background.
  - Use a saturated, memorable color (avoid grays and whites).
  - Test with light and dark mode to ensure readability.

#### Secondary Color

- **What it is:** A complementary color for secondary actions, badges, and supporting elements.
- **Default:** Teal (`#10B981`)
- **Tips:**
  - Works well as a contrasting accent (e.g., for progress, positive actions).
  - Should pair well visually with your Primary Color.

#### Accent Color

- **What it is:** A bright, energetic color for highlights, alerts, and emphasis.
- **Default:** Warm amber (`#F59E0B`)
- **Tips:**
  - Often used for warnings, secondary CTAs, and interactive hover states.
  - Should be distinct from Primary and Secondary colors.

#### Color Contrast Feedback

- **WCAG Validation** — When you set a color pair, Next.js SaaS AI Template automatically checks if it meets Web Content Accessibility Guidelines (WCAG) standards for contrast.
- **Green check** — Your color pair meets **WCAG AA** (4.5:1 contrast ratio for normal text).
- **Orange warning** — Good contrast, but consider improving for AA compliance.
- **Recommendation** — If contrast is low, the system suggests lighter or darker shades to meet accessibility standards.

**Example:**

```
Primary: #0066CC (Blue)
Background: #FFFFFF (White)
Contrast ratio: 8.6:1 ✓ WCAG AAA (best readability)
```

---

### Typography

Customize how text appears across the platform.

#### Font Family

Choose from several professionally maintained font families:

- **DM Sans** (default) — Modern, friendly, slightly rounded. Great for tech products.
- **Inter** — Neutral, highly legible. Excellent for UI and body text.
- **Open Sans** — Warm, approachable. Works well for corporate environments.
- **System Font** — Uses your OS default (San Francisco on Mac, Segoe UI on Windows). Fastest loading with no external fonts.

**Tips:**

- If performance is critical, use **System Font**.
- For brand consistency, match the font and weights used on your marketing site.
- All fonts include weights 400 (regular), 500 (medium), 600 (semibold), and 700 (bold).

---

### Density

Control how much spacing (padding and margin) is used throughout the interface.

- **Compact** (0.75x) — Reduced spacing. More data per screen. Good for teams managing many items.
- **Default** (1x) — Balanced spacing. Standard Next.js SaaS AI Template experience.
- **Comfortable** (1.25x) — Increased spacing. Better for accessibility and readability. Recommended for aging audiences or accessibility-first organizations.

**Tips:**

- Compact is useful for data-heavy admin dashboards or large team views.
- Comfortable is better for members focusing on personal development.
- You can only set one density per tenant; individual users cannot override it.

---

### Surface Style

Control the visual depth and elevation of cards, panels, and containers.

- **Flat** — No shadows, minimal visual separation. Clean, minimal aesthetic.
- **Elevated** (default) — Subtle shadows and depth cueing. Easier to scan visually.
- **Glass** (Glassmorphism) — Frosted glass effect with blur and transparency. Modern, trending aesthetic.

**Tips:**

- **Flat** works well for high-density, data-focused interfaces.
- **Elevated** is the safest default for balanced aesthetics and usability.
- **Glass** is modern and visually striking; test in dark mode to ensure it remains readable.

---

### Neutral Warmth

Fine-tune the undertone of your neutral colors (grays and borders).

- **Cool** — Grays with blue undertone. Feels fresh and technical. Use with cool-toned colors.
- **Neutral** (default) — Pure grays, no warmth or cool. Versatile and modern.
- **Warm** — Grays with warm (orange/brown) undertone. Feels friendly and approachable. Use with warm-toned colors.

**Tips:**

- Match the warmth of your neutral palette to your Primary Color for visual harmony.
- Cool works with blues, teals, purples.
- Warm works with oranges, reds, browns.
- Neutral is safest for corporate environments.

---

## Logo & Organization Identity

In addition to colors and typography:

- **Tenant name** — Your organization name, displayed in headers and footers.
- **Logo** — (If available) Upload your organization logo for the header and login page.
- **Favicon** — The small icon shown in the browser tab.
- **Email template colors** — Emails sent from the platform can use your brand colors.

---

## Preview & Live Testing

Before saving, use the **preview panel** in the Branding settings to:

1. See your color choices applied to buttons, cards, and UI elements
2. Toggle between light and dark mode
3. Check text contrast and readability

**Always test:**

- Light mode and dark mode
- Different screen sizes (desktop, tablet, mobile)
- Across your team (get feedback from a few users)

---

## Best Practices

### Consistency

- Match the colors and fonts on your marketing site, if possible.
- Use consistent branding across Next.js SaaS AI Template, email templates, and integrations.

### Accessibility

- Always maintain good contrast (WCAG AA or AAA).
- Use Next.js SaaS AI Template's built-in contrast validator when picking colors.
- Don't rely solely on color to communicate meaning (e.g., use icons + color for status).

### Performance

- Avoid too many custom fonts; stick to 1–2 font families.
- System Font loads fastest; custom fonts may add 50–200ms to page load.
- The visual difference is minimal for most users.

### Dark Mode

- Test all color choices in dark mode.
- Glass surfaces may need adjustment to remain readable in dark.
- Ensure your Primary Color is bright enough on dark backgrounds.

### Mobile

- Density and surface style impact mobile usability significantly.
- Test on an actual phone or tablet, not just browser devtools.
- Smaller screens benefit from Comfortable spacing and Elevated surface style.

---

## Resetting to Defaults

If you want to start over:

1. Go to **Settings** → **Branding**
2. Click **Reset to Defaults** (if available)
3. Confirm

This will revert all colors, fonts, density, and surface styles to Next.js SaaS AI Template defaults. Your tenant name and logo remain unchanged.

---

## Troubleshooting

**Colors are not changing after I save:**

- Refresh the page or clear browser cache (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows).
- Check your internet connection.
- If the issue persists, contact Next.js SaaS AI Template support.

**My custom font isn't showing:**

- Some browsers block external fonts if you're behind a corporate proxy.
- Try System Font as an alternative.
- Ask your IT team to allowlist `fonts.googleapis.com` or `fonts.gstatic.com` if using custom fonts.

**Text contrast warning—what should I do?**

- The built-in validator suggests lighter or darker shades.
- You can accept the suggestion or manually adjust.
- WCAG AA (4.5:1) is the minimum legal standard; AAA (7:1) is better for accessibility.

**Dark mode looks different than light mode:**

- This is normal; color perception changes with background brightness.
- Adjust your colors for both modes, or reach out for design help.

---

## Next Steps

- **Explore other settings** → [Settings Overview](./settings)
- **Add integrations** → [Integrations Guide](./integrations)
- **Manage members and roles** → [Members & Invitations](./members)
- **Want more design guidance?** → Contact your Next.js SaaS AI Template designer or reach out to <support@example.com>

Your brand matters. Take time to get the colors and typography perfect—it's one of the first things people see in Next.js SaaS AI Template every day.
