# React Router v7 Extension

This extension adds React Router v7 (BrowserRouter setup, client-side routing) to your React template.

## Features

- **BrowserRouter Setup**: Configures global router at the root.
- **Client-Side Routing**: Demonstrates route mapping and code-splitting ready structure.
- **Sample Pages**: Includes a template Landing page and a sample `About` page to showcase navigation.

## Usage

### Route Configuration

All routes are declared in `src/routes/AppRoutes.tsx`:

```typescript
import React from 'react';
import { Route, Routes } from 'react-router-dom';

import Landing from '@/pages/Landing';
import About from '@/pages/About';

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Landing />} />
    <Route path="/about" element={<About />} />
  </Routes>
);

export default AppRoutes;
```

### Navigating between pages

Use the `<Link>` component from `react-router-dom`:

```typescript
import { Link } from 'react-router-dom';

export default function MyComponent() {
  return (
    <Link to="/about">About Page</Link>
  );
}
```

## Documentation

See [React Router v7 Documentation](https://reactrouter.com) for more details.
