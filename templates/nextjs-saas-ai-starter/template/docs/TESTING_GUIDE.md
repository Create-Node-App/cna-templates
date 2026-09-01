# React Testing Library with Jest Guide

## Quick Start

React Testing Library and Jest are configured in this project. See the [official documentation](https://testing-library.com/docs/react-testing-library/intro/) for complete details.

## Essential Patterns

### Basic Component Testing

Test components with user interactions:

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  test('renders button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  test('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Form Testing

Test form interactions and validation:

```tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContactForm } from './ContactForm';

describe('ContactForm', () => {
  test('submits form with valid data', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();

    render(<ContactForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/name/i), 'John Doe');
    await user.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
        name: 'John Doe',
      });
    });
  });

  test('shows validation errors', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    await user.click(screen.getByRole('button', { name: /submit/i }));

    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    expect(screen.getByText(/name is required/i)).toBeInTheDocument();
  });
});
```

### Async Testing

Handle asynchronous operations:

```tsx
import { render, screen, waitFor } from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { UserList } from './UserList';

const server = setupServer(
  rest.get('/api/users', (req, res, ctx) => {
    return res(
      ctx.json([
        { id: 1, name: 'John Doe' },
        { id: 2, name: 'Jane Smith' },
      ]),
    );
  }),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('UserList', () => {
  test('displays users after loading', async () => {
    render(<UserList />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
  });
});
```

### Hook Testing

Test custom hooks:

```tsx
import { renderHook, act } from '@testing-library/react';
import { useCounter } from './useCounter';

describe('useCounter', () => {
  test('should initialize with 0', () => {
    const { result } = renderHook(() => useCounter());
    expect(result.current.count).toBe(0);
  });

  test('should increment counter', () => {
    const { result } = renderHook(() => useCounter());

    act(() => {
      result.current.increment();
    });

    expect(result.current.count).toBe(1);
  });
});
```

## Testing Patterns

### Query Priorities

Use queries in this order:

1. `getByRole` - Most accessible
2. `getByLabelText` - Form elements
3. `getByText` - Text content
4. `getByTestId` - Last resort

```tsx
// ✅ Good: Accessible queries
screen.getByRole('button', { name: /submit/i });
screen.getByLabelText(/email/i);
screen.getByText(/welcome/i);

// ❌ Avoid: Implementation details
screen.getByClassName('btn-primary');
```

### User Interactions

Prefer `userEvent` over `fireEvent`:

```tsx
import userEvent from '@testing-library/user-event';

// ✅ Good: More realistic user interactions
const user = userEvent.setup();
await user.click(button);
await user.type(input, 'text');

// ❌ Avoid: Less realistic
fireEvent.click(button);
fireEvent.change(input, { target: { value: 'text' } });
```

### Mock API Calls

Use MSW for API mocking:

```tsx
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  rest.get('/api/data', (req, res, ctx) => {
    return res(ctx.json({ message: 'Success' }));
  }),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

## Jest Configuration

### Setup Files

Configure global test setup:

```javascript
// jest.setup.js
import '@testing-library/jest-dom';

// Mock global functions
global.fetch = jest.fn();

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
  })),
});
```

### Test Utilities

Create reusable test utilities:

```tsx
// test-utils.tsx
import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '../src/theme';

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};

const customRender = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
  render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
```

## Common Issues

### Act Warnings

Wrap state updates in `act`:

```tsx
await act(async () => {
  await user.click(button);
});
```

### Cleanup

Clean up after tests:

```tsx
afterEach(() => {
  cleanup();
  jest.clearAllMocks();
});
```

### Timer Mocks

Handle timers properly:

```tsx
beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});
```

## Resources

- [React Testing Library Documentation](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Library Queries](https://testing-library.com/docs/queries/about)
- [MSW Documentation](https://mswjs.io/docs/)

---

## Accessibility (a11y) Testing & WCAG 2.1 AA Compliance

This project enforces accessibility standards using ESLint rules, automated contrast validation, and manual testing practices. See [docs/DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) for design system accessibility principles.

### Automated a11y Linting

ESLint is configured with `eslint-plugin-jsx-a11y` to catch accessibility violations at development time.

**Running a11y lint check:**

```bash
pnpm lint:a11y
```

**Common rules enforced:**

- `jsx-a11y/alt-text` — All `<img>` must have meaningful alt text
- `jsx-a11y/aria-role` — ARIA role values must be valid
- `jsx-a11y/aria-props` — All aria-\* props must exist
- `jsx-a11y/click-events-have-key-events` — Elements with click handlers must support keyboard (Enter/Space)
- `jsx-a11y/no-static-element-interactions` — Only clickable semantic elements (button, link) should handle interactions
- `jsx-a11y/label-has-associated-control` — All form inputs must have associated labels
- `jsx-a11y/heading-has-content` — All headings must have text content

**Disable rule for specific lines only when justified:**

```tsx
{
  /* eslint-disable-next-line jsx-a11y/click-events-have-key-events */
}
<div onClick={handleClick} role="button" tabIndex={0}>
  Custom Button
</div>;
```

### Color Contrast Validation

Tenant-configurable colors are validated for WCAG AA compliance in the BrandingSettings admin UI.

**Manual contrast checking:**

```typescript
import { validateColorContrast, meetsWCAGAA } from '@/shared/lib/a11y';

const result = validateColorContrast('#4F5BD5', '#FFFFFF');
console.log(result.ratio); // 5.02:1
console.log(result.meetsAA); // true
console.log(result.recommendation); // "✓ Colors meet WCAG AA standard..."
```

**WCAG AA Standards:**

- **Normal text:** Minimum 4.5:1 contrast ratio
- **Large text:** Minimum 3:1 contrast ratio (18px+ or 14px+ bold)
- **UI components/borders:** Minimum 3:1 contrast ratio

### Keyboard Navigation Testing

**Test checklist for any interactive component:**

- [ ] Tab: Can reach all interactive elements in logical order
- [ ] Shift+Tab: Can navigate backwards through interactive elements
- [ ] Enter/Space: Activates buttons and checkboxes
- [ ] Arrow Keys: Navigate through radio groups, selects, menus
- [ ] Escape: Closes modals, dropdowns, popovers
- [ ] Focus indicators: Visible at all times (ring-ring CSS class)

**Manual testing:**

```bash
# Open your app and test locally
pnpm dev

# Then use keyboard only (no mouse) to navigate:
# 1. Tab through all interactive elements
# 2. Verify focus ring is visible (should be blue by default, customizable via primary color)
# 3. Test modal interactions (Escape closes)
# 4. Test form submission (Enter on inputs)
```

### Focus Management

All interactive elements must have visible focus indicators. The design system provides `ring-ring` class:

```tsx
<button className="px-3 py-2 rounded-lg ring-offset-2 focus:ring-2 focus:ring-ring">Focus visible</button>
```

**Focus order should match visual order.** Test with keyboard navigation.

### Screen Reader Testing

#### Using NVDA (Windows), JAWS (Windows), or VoiceOver (macOS/iOS)

1. **Semantic HTML:** Use proper elements (`<button>`, `<a>`, `<h1>`, `<label>`)
2. **ARIA labels:** Add descriptive text for icon buttons

   ```tsx
   <button aria-label="Close dialog">
     <X className="h-4 w-4" />
   </button>
   ```

3. **Form associations:** Labels must be connected to inputs

   ```tsx
   <Label htmlFor="email">Email</Label>
   <Input id="email" />
   ```

4. **Live regions:** Announce dynamic content with `aria-live`

   ```tsx
   <div aria-live="polite" aria-atomic="true">
     {statusMessage}
   </div>
   ```

#### Quick Test on macOS

```bash
# Enable VoiceOver: Cmd+F5
# Web rotor (VoiceOver menu): VO+U
# Read page: VO+A
# Navigate headings: VO+left/right arrow
```

### Dark Mode Contrast Verification

Dark mode colors must also meet WCAG AA standards:

1. **Test in dark mode:** Toggle theme in dev tools
2. **Check performance color:** Orange (`oklch(65% 0.17 55)`) may need adjustment
3. **Verify text colors:** Should be `neutral-50` or `neutral-100`, not gray-500
4. **Validate brand colors:** Primary/secondary may need lightening in dark mode

**Automated check:**

```typescript
import { validateColorContrast } from '@/shared/lib/a11y';

// Test dark mode: white text on dark background
const darkResult = validateColorContrast('#FFFFFF', '#1F2937');
console.log(darkResult.meetsAA); // Should be true
```

### Motion & Animation Accessibility

Respect user's motion preferences (`prefers-reduced-motion`):

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

The design system global CSS already includes this. Test:

```bash
# macOS: System Preferences > Accessibility > Display > Reduce motion
# Windows: Settings > Ease of Access > Display > Show animations
# Then reload the app and verify animations are disabled
```

### Automated Accessibility Audit

Use Lighthouse in Chrome DevTools:

1. Open DevTools → Lighthouse
2. Select "Accessibility"
3. Run audit
4. Fix any issues with a score < 90

**CI/CD Integration:**

```bash
# Run on every pull request
pnpm lint:a11y
pnpm test

# Optional: Add Chromatic for visual regression testing
pnpm chromatic
```

### Common a11y Fixes

#### Missing alt text

```tsx
// ❌ Bad
<img src="logo.png" />

// ✅ Good
<img src="logo.png" alt="Company logo" />

// ✅ Good (decorative)
<img src="spacer.png" alt="" aria-hidden="true" />
```

#### Missing form label

```tsx
// ❌ Bad
<input placeholder="Email" />

// ✅ Good
<label htmlFor="email">Email</label>
<input id="email" placeholder="example@com" />
```

#### Icon button without label

```tsx
// ❌ Bad
<button><Settings /></button>

// ✅ Good
<button aria-label="Settings"><Settings /></button>
```

#### Click handler on non-semantic element

```tsx
// ❌ Bad
<div onClick={handleDelete}>Delete</div>

// ✅ Good
<button onClick={handleDelete}>Delete</button>

// ✅ Good (if div is necessary)
<div
  onClick={handleDelete}
  onKeyDown={(e) => e.key === 'Enter' && handleDelete()}
  role="button"
  tabIndex={0}
>Delete</div>
```

#### Multiple pages form

```tsx
// ✅ Good
<h1>Create Account</h1>
<fieldset>
  <legend>Contact Information</legend>
  {/* inputs */}
</fieldset>
<fieldset>
  <legend>Preferences</legend>
  {/* inputs */}
</fieldset>
```

### Testing with React Testing Library + a11y

Prefer querying by accessible roles:

```typescript
// ❌ Avoid (brittle, not accessible)
screen.getByTestId('submit-btn');

// ✅ Prefer (ensures accessibility)
screen.getByRole('button', { name: 'Submit' });

// ✅ Prefer
screen.getByLabelText('Email');

// ✅ Prefer
screen.getByText('Thank you!');
```

### Resources

- [WCAG 2.1 Overview](https://www.w3.org/WAI/WCAG21/quickref/)
- [Web Accessibility by Google](https://www.udacity.com/course/web-accessibility--ud891)
- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- [eslint-plugin-jsx-a11y](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Axe DevTools](https://www.deque.com/axe/devtools/) — Browser extension for a11y audit
