# Material UI Best Practices

## Quick Start

Material UI is already configured in this project. See the [official documentation](https://mui.com/getting-started/) for complete setup details.

## Essential Patterns

### Theme Setup
Always wrap your app with ThemeProvider:

```tsx
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* Your app */}
    </ThemeProvider>
  );
}
```

### Component Styling
Prefer `sx` prop for styling:

```tsx
// ✅ Good: Using sx prop
<Button sx={{ mt: 2, px: 3, bgcolor: 'primary.main' }}>
  Submit
</Button>

// ❌ Avoid: Inline styles
<Button style={{ marginTop: 16, paddingLeft: 24 }}>
```

### Responsive Design
Use theme breakpoints:

```tsx
<Box sx={{
  width: { xs: '100%', sm: 400, md: 600 },
  p: { xs: 1, sm: 2, md: 3 }
}}>
  Content
</Box>
```

### Dark Mode Support
```tsx
const theme = createTheme({
  palette: {
    mode: 'dark', // or 'light'
  },
});
```

## Common Patterns

### Forms with Validation
```tsx
import { TextField, Button, Stack } from '@mui/material';
import { useForm } from 'react-hook-form';

function ContactForm() {
  const { register, handleSubmit, formState: { errors } } = useForm();

  return (
    <Stack spacing={2} component="form" onSubmit={handleSubmit(onSubmit)}>
      <TextField
        {...register('email', { required: 'Email is required' })}
        label="Email"
        error={!!errors.email}
        helperText={errors.email?.message}
      />
      <Button type="submit" variant="contained">
        Submit
      </Button>
    </Stack>
  );
}
```

### Loading States
```tsx
import { Button, CircularProgress } from '@mui/material';

<Button 
  disabled={loading}
  startIcon={loading ? <CircularProgress size={20} /> : null}
>
  {loading ? 'Saving...' : 'Save'}
</Button>
```

### Data Display
```tsx
import { Card, CardContent, Typography, Chip } from '@mui/material';

<Card>
  <CardContent>
    <Typography variant="h6" gutterBottom>
      Product Name
    </Typography>
    <Typography variant="body2" color="text.secondary">
      Description
    </Typography>
    <Chip label="In Stock" color="success" size="small" />
  </CardContent>
</Card>
```

## Performance Tips

- Use `sx` prop instead of `styled()` for simple styling
- Leverage theme tokens instead of hardcoded values
- Use Material UI's built-in icons when possible
- Implement proper loading and error states

## Common Issues

### Theme Not Applied
Check if `ThemeProvider` wraps your app:
```tsx
// Make sure this wraps your entire app
<ThemeProvider theme={theme}>
  <App />
</ThemeProvider>
```

### Icons Not Loading
Import icons individually:
```tsx
// ✅ Good
import DeleteIcon from '@mui/icons-material/Delete';

// ❌ Avoid (increases bundle size)
import { Delete } from '@mui/icons-material';
```

### Styling Conflicts
Use `sx` prop for overrides:
```tsx
// ✅ Good: sx prop overrides
<Button sx={{ mt: 2 }} variant="contained">

// ❌ Avoid: CSS classes for Material UI components
<Button className="my-custom-button">
```

## Resources

- [Material UI Documentation](https://mui.com/)
- [Component Demos](https://mui.com/components/)
- [Theming Guide](https://mui.com/customization/theming/)
- [Design Tokens](https://mui.com/design-tokens/overview/) 