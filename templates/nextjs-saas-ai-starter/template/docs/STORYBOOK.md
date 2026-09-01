# Storybook

Next.js SaaS AI Template uses [Storybook](https://storybook.js.org/) for developing, documenting, and visually testing UI components in isolation.

---

## Quick Start

```bash
# Start Storybook development server
pnpm storybook

# Build static Storybook for deployment
pnpm build-storybook
```

Storybook runs at **http://localhost:6006**.

---

## Setup

### Framework

We use **`@storybook/nextjs-vite`** (Storybook 10) for seamless Next.js + Vite integration:

- Automatic Tailwind CSS support via `globals.css`
- Next.js image, font, and routing stubs
- Vite-based build for fast HMR

### Configuration Files

| File                            | Purpose                                     |
| ------------------------------- | ------------------------------------------- |
| `.storybook/main.ts`            | Framework config, story globs, Vite aliases |
| `.storybook/preview.ts`         | Global decorators, parameters, theme setup  |
| `.storybook/mock-messages.ts`   | Mock i18n messages for `next-intl`          |
| `.storybook/empty-module.js`    | Stub for server-only Node modules           |
| `.storybook/perf_hooks-stub.js` | Stub for `perf_hooks` (server-only)         |

### Story Discovery

Stories are loaded from:

```typescript
stories: [
  '../src/shared/components/ui/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  '../src/features/**/*.stories.@(js|jsx|mjs|ts|tsx)',
],
```

### Global Decorators

Every story is wrapped in these providers (configured in `preview.ts`):

1. **`ThemeProvider`** — light/dark theme support
2. **`NextIntlClientProvider`** — i18n messages
3. **`TenantProvider`** — mock tenant context (`demo`)

This ensures components work in Storybook the same way they do in the application.

### Node Module Stubs

Server-only modules (`fs`, `net`, `tls`, `perf_hooks`) are stubbed out in `.storybook/main.ts` to prevent build errors when components import from modules that transitively depend on Node APIs:

```typescript
viteFinal: async (config) => {
  config.resolve.alias = {
    ...config.resolve.alias,
    perf_hooks: path.join(stubDir, 'perf_hooks-stub.js'),
    fs: emptyModule,
    net: emptyModule,
    tls: emptyModule,
  };
  return config;
},
```

---

## Writing Stories

### File Naming

Stories are colocated with their component:

```
src/shared/components/ui/
├── button.tsx
├── button.stories.tsx     ← Story file
├── card.tsx
├── card.stories.tsx
```

### Story Template

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { MyComponent } from './my-component';

const meta: Meta<typeof MyComponent> = {
  title: 'UI/MyComponent',        // Category/name in Storybook sidebar
  component: MyComponent,
  tags: ['autodocs'],              // Enable auto-generated docs
  args: {                          // Default args for all stories
    children: 'Hello',
  },
};

export default meta;
type Story = StoryObj<typeof MyComponent>;

export const Default: Story = {};

export const WithVariant: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary',
  },
};

export const Interactive: Story = {
  render: (args) => (
    <div className="flex gap-2">
      <MyComponent {...args}>Option A</MyComponent>
      <MyComponent {...args} variant="outline">Option B</MyComponent>
    </div>
  ),
};
```

### Story Categories

We organize stories under these categories:

| Category                 | Location                      | Examples                            |
| ------------------------ | ----------------------------- | ----------------------------------- |
| `UI/`                    | `src/shared/components/ui/`   | Button, Card, Form, LevelSelector   |
| `Features/Assistant/`    | `src/features/assistant/`     | ChatMessageRenderer, PersonMiniCard |
| `Features/Profile/`      | `src/features/profile/`       | ProfileClient, SkillInterestFilters |
| `Features/PeopleFinder/` | `src/features/people-finder/` | SearchResults, PersonMatchCard      |
| `Features/Assessments/`  | `src/features/assessments/`   | SelfAssessmentWizard                |

---

## Existing Stories

The following components have stories:

### Shared UI Components

- `button.stories.tsx` — Button variants, sizes, states
- `card.stories.tsx` — Card layouts and accents
- `form.stories.tsx` — Form field patterns
- `capability-match-card.stories.tsx` — Capability match display
- `compared-level-badge.stories.tsx` — Level comparison badges
- `level-indicator.stories.tsx` — Level visualization
- `level-selector.stories.tsx` — Level picker interaction
- `skill-level-assessment-row.stories.tsx` — Assessment row layout
- `skill-level-badge.stories.tsx` — Skill level display
- `team-member-card.stories.tsx` — Team member card
- `view-mode-toggle.stories.tsx` — Grid/list toggle
- `wizard-step-indicator.stories.tsx` — Wizard progress

### Feature Components

- Assistant: `ChatMessageRenderer`, `ComparisonTableCard`, `ToolPartRenderer`, `KnowledgeDocCard`, `CapabilityRequirementsCard`, `SkillInlineList`, `SkillInlineCard`, `PersonMiniCard`
- Profile: `ProfileClient`, `SkillInterestFilters`, `InterestsManager`
- People Finder: `SearchResults`, `CapabilitySearch`, `PersonMatchCard`
- Assessments: `SelfAssessmentWizard`

---

## Using Mock Data

### i18n Messages

Storybook uses mock translations defined in `.storybook/mock-messages.ts`. When adding new translated strings to a component, add the corresponding mock entry there.

### Tenant Context

A mock tenant is provided via `TenantProvider`:

```typescript
const mockTenant = { slug: 'demo', id: 'tenant-demo', name: 'Demo Tenant' };
```

### Server Actions / API Calls

For components that call server actions or API routes, use Storybook's `args` and `action()` to mock:

```typescript
import { fn } from '@storybook/test';

export const Default: Story = {
  args: {
    onSave: fn(),
    onCancel: fn(),
  },
};
```

---

## Adding Stories for New Components

When creating a new UI component:

1. Create the story file next to the component: `my-component.stories.tsx`
2. Use the appropriate category prefix in `title` (e.g., `UI/MyComponent`)
3. Include at least a `Default` story and one variant
4. Add `tags: ['autodocs']` for automatic documentation
5. Test in both light and dark modes using Storybook's background switcher

---

## Troubleshooting

### "Module not found" for Server-Only Code

If a component imports from a module that depends on Node APIs (e.g., database, auth):

1. Add the module to the alias map in `.storybook/main.ts`
2. Or extract the server dependency so the component can be rendered with mocked data

### Styles Not Loading

Ensure `globals.css` is imported in `.storybook/preview.ts`:

```typescript
import '../src/app/globals.css';
```

### i18n Errors

Add missing message keys to `.storybook/mock-messages.ts`.

---

## Related Documentation

- [shadcn/ui Components Guide](./SHADCN_AND_COMPONENTS.md) — Component inventory and patterns
- [Components & Styling](./COMPONENTS_AND_STYLING.md) — Tailwind CSS and styling conventions
- [Testing Guide](./TESTING_GUIDE.md) — Unit and integration testing
