# Tailwind CSS Best Practices

## Quick Start

Tailwind CSS is configured when this extension is applied. Make sure the generator created the following files:

- `tailwind.config.js`
- `postcss.config.js`
- Global stylesheet with Tailwind directives

## Recommended `tailwind.config.js`

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f8ff',
          100: '#ebf1ff',
          200: '#d6e3ff',
          300: '#adc7ff',
          400: '#7aa5ff',
          500: '#3d7dff',
          600: '#1559e6',
          700: '#0f44b4',
          800: '#0d378f',
          900: '#0c2f75'
        }
      },
      borderRadius: {
        'xl': '1rem'
      }
    }
  },
  plugins: []
}
```

## Patterns

### Dark Mode Toggle

```tsx
export function ThemeToggle() {
  function toggle() {
    document.documentElement.classList.toggle('dark');
  }
  return (
    <button
      onClick={toggle}
      className="rounded-md border px-3 py-1 text-sm bg-white dark:bg-zinc-800 dark:text-zinc-100 transition-colors"
    >
      Toggle Theme
    </button>
  );
}
```

### Container + Layout

```tsx
export const Page: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mx-auto max-w-3xl px-4 py-10">
    <h1 className="mb-6 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">{title}</h1>
    <div className="space-y-4">{children}</div>
  </div>
);
```

### Accessible Button Variants

```tsx
const base = 'inline-flex items-center rounded-md text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed';
const variants = {
  primary: 'bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:outline-indigo-600',
  secondary: 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700 focus-visible:outline-zinc-500',
  ghost: 'bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800'
} as const;

export function UiButton({ variant = 'primary', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof variants }) {
  return <button className={`${base} ${variants[variant]}`} {...props} />;
}
```

## Performance Tips

- Prefer grouping related classes logically: layout -> spacing -> color -> typography -> effects.
- Remove unused content paths to reduce build size.
- Use `@apply` sparingly; prefer inline utility composition.
- Consider CSS variables for design tokens that change at runtime.

## Common Issues

### Styles Not Applying

- Verify the file is inside configured `content` globs.
- Ensure the build process includes PostCSS with Tailwind plugin.

### Dark Mode Not Working

- Confirm `darkMode: 'class'` and a `.dark` class is on `<html>`.

### Large CSS Bundle

- Remove unused plugins.
- Confirm no broad content globs like `./src/**/*` plus duplicated paths.

## Resources

- [Tailwind Docs](https://tailwindcss.com/docs)
- [Play CDN (for quick prototyping)](https://tailwindcss.com/docs/installation/play-cdn)
- [Dark Mode](https://tailwindcss.com/docs/dark-mode)
