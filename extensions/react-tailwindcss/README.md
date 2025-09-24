# React Tailwind CSS Extension

This extension adds Tailwind CSS utility-first styling to your React application with zero-runtime design and customization best practices.

## Features

- Tailwind CSS configuration
- PostCSS + Autoprefixer setup
- Dark mode class strategy
- Example component patterns
- Recommended plugin list (optional)

## Documentation

See the [Tailwind Guide](./docs/TAILWIND_GUIDE.md) for patterns, best practices, and troubleshooting tips.

## Usage

When this extension is added, you should:

1. Ensure `tailwind.config.js` and `postcss.config.js` are added at project root (generator should scaffold them):
2. Add Tailwind directives to your global stylesheet (e.g. `src/index.css` or `src/global.css`).
3. Use utility classes directly in your components.

Example global CSS:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Example component:

```tsx
export function Button({ children }: { children: React.ReactNode }) {
  return (
    <button className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors">
      {children}
    </button>
  );
}
```

## Resources

- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Configuration](https://tailwindcss.com/docs/configuration)
- [Dark Mode](https://tailwindcss.com/docs/dark-mode)
- [Plugins](https://tailwindcss.com/docs/plugins)
