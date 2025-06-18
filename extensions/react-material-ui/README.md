# Material UI Extension

This extension adds [Material UI](https://mui.com/) to your React application, providing a comprehensive set of pre-built components following Google's Material Design guidelines.

## Compatibility

- ✅ React Vite Starter
- ✅ Next.js Starter
- ❌ NestJS Starter

## Installation

This extension is automatically installed when you select it during project creation:

```bash
create-awesome-node-app --template react-vite-starter --addons material-ui
```

## Features

- Pre-configured Material UI setup
- Theme customization support
- TypeScript support
- Responsive design components
- Material Icons integration

## Usage

After installation, you can start using Material UI components in your application:

```tsx
import { Button, Typography } from '@mui/material';

function MyComponent() {
  return (
    <div>
      <Typography variant="h1">Hello World</Typography>
      <Button variant="contained" color="primary">
        Click me
      </Button>
    </div>
  );
}
```

## Theme Customization

The extension includes a basic theme configuration. You can customize it by modifying the theme file in your project:

```tsx
// src/theme.ts
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  // Your custom theme configuration
});

export default theme;
```

## Additional Resources

- [Material UI Documentation](https://mui.com/getting-started/usage/)
- [Material Icons](https://mui.com/material-ui/material-icons/)
- [Theme Customization](https://mui.com/material-ui/customization/theming/)

## Troubleshooting

If you encounter any issues:

1. Make sure you have the latest version of the extension
2. Check the [Material UI GitHub Issues](https://github.com/mui/material-ui/issues)
3. Open an issue in this repository
