# React i18n Extension

This extension adds internationalization support to your React application with react-i18next for managing translations and multi-language support.

## Features

- Integration with react-i18next
- Translation management tools
- Language switching capabilities
- Pluralization support
- Performance optimization
- Development workflow helpers

## Usage

Internationalization is automatically configured when this extension is added to your project. The extension includes:

- react-i18next setup and configuration
- Translation files structure
- Language detection and switching
- TypeScript support for translations
- Development tools and helpers

## Translation Structure

```
public/locales/
├── en/
│   └── common.json
├── es/
│   └── common.json
└── fr/
    └── common.json
```

## Basic Usage

```tsx
import { useTranslation } from 'react-i18next';

function Welcome() {
  const { t } = useTranslation();
  
  return <h1>{t('welcome.title')}</h1>;
}
```

## Resources

- [react-i18next Documentation](https://react.i18next.com/)
- [i18next Documentation](https://www.i18next.com/)
- [Internationalization Best Practices](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Internationalization) 