# Chakra UI Best Practices

## Quick Start

Chakra UI is already configured in this project via `ChakraProvider` (registered in `app-providers.tsx`). See the [official documentation](https://chakra-ui.com/docs/get-started) for complete setup details.

## Essential Patterns

### Provider Setup
The app is wrapped with `ChakraProvider` using the default system theme:

```tsx
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';

function Root({ children }: { children: React.ReactNode }) {
  return <ChakraProvider value={defaultSystem}>{children}</ChakraProvider>;
}
```

### Custom Theme
Extend the default system with semantic tokens and recipes:

```tsx
import { createSystem, defaultConfig } from '@chakra-ui/react';

const system = createSystem(defaultConfig, {
  theme: {
    tokens: {
      colors: {
        brand: {
          500: { value: '#319795' },
        },
      },
    },
  },
});

// Pass `value={system}` to ChakraProvider instead of `defaultSystem`.
```

### Component Usage
```tsx
import { Button, Stack, Text } from '@chakra-ui/react';

function Welcome() {
  return (
    <Stack gap={4} align="start">
      <Text fontSize="xl" fontWeight="bold">
        Hello, Chakra
      </Text>
      <Button colorPalette="teal">Get started</Button>
    </Stack>
  );
}
```

### Responsive Design
Use responsive style props with breakpoint objects:

```tsx
<Stack direction={{ base: 'column', md: 'row' }} gap={{ base: 2, md: 4 }}>
  Content
</Stack>
```

### Dark Mode Support
Chakra UI v3 supports dark mode out of the box via `colorPalette` and semantic tokens:

```tsx
import { ColorModeButton } from './components/ui/color-mode';

<ColorModeButton />
```

## Common Patterns

### Forms with Validation
```tsx
import { Button, Field, Input, Stack } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';

function ContactForm() {
  const { register, handleSubmit, formState: { errors } } = useForm();

  return (
    <Stack gap={4} as="form" onSubmit={handleSubmit(onSubmit)}>
      <Field.Root invalid={!!errors.email}>
        <Field.Label>Email</Field.Label>
        <Input {...register('email', { required: 'Email is required' })} />
        <Field.ErrorText>{errors.email?.message as string}</Field.ErrorText>
      </Field.Root>
      <Button type="submit" colorPalette="teal">
        Submit
      </Button>
    </Stack>
  );
}
```

### Loading States
```tsx
import { Button, Spinner } from '@chakra-ui/react';

<Button disabled={loading} colorPalette="teal">
  {loading ? <Spinner size="sm" /> : null}
  {loading ? 'Saving...' : 'Save'}
</Button>
```

### Data Display
```tsx
import { Badge, Card, Text } from '@chakra-ui/react';

<Card.Root>
  <Card.Header>
    <Text fontWeight="semibold">Product Name</Text>
  </Card.Header>
  <Card.Body>
    <Text fontSize="sm" color="fg.muted">
      Description
    </Text>
    <Badge colorPalette="green">In Stock</Badge>
  </Card.Body>
</Card.Root>
```

## Performance Tips

- Import components individually instead of the whole barrel when bundling for production
- Leverage theme tokens instead of hardcoded values
- Use Chakra UI's built-in primitives when possible
- Implement proper loading and error states

## Common Issues

### Provider Not Applied
Check that `ChakraProvider` wraps your app in `app-providers.tsx`:

```tsx
// Make sure this provider is registered
appProviders.push((children) => (
  <ChakraProvider value={defaultSystem}>{children}</ChakraProvider>
));
```

### Styles Not Loading
Chakra UI v3 uses Emotion under the hood. Make sure `@emotion/react` and `@emotion/styled` are installed:

```bash
npm ls @emotion/react @emotion/styled
```

### Styling Conflicts
Use Chakra style props and recipes for overrides:

```tsx
// Good: style props compose with the theme
<Button mt={2} colorPalette="teal">

// Avoid: CSS classes for Chakra components
<Button className="my-custom-button">
```

## Resources

- [Chakra UI Documentation](https://chakra-ui.com/)
- [Component Demos](https://chakra-ui.com/docs/components)
- [Theming Guide](https://chakra-ui.com/docs/theming)
- [Migration from v2](https://chakra-ui.com/docs/migration)
