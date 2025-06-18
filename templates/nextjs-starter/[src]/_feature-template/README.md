# Feature Template

This directory serves as a template for creating new features in the application. It demonstrates the recommended structure and patterns for implementing features using Feature-Based Architecture.

## Structure

```
_feature-template/
|
+-- components/ # Feature-specific components
|   +-- ExampleComponent.tsx
|   +-- ExampleComponent.module.css
|
+-- hooks/ # Feature-specific hooks
|   +-- useExample.ts
|
+-- services/ # Feature-specific services
|   +-- exampleService.ts
|
+-- types/ # Feature-specific types
|   +-- index.ts
|
+-- index.ts # Public API
```

## Usage

1. Copy this directory and rename it to your feature name
2. Update the component, hook, and service names
3. Implement your feature's functionality
4. Export only what's needed through index.ts

## Best Practices

1. **Encapsulation**
   - Keep feature-specific code within the feature directory
   - Use the public API (index.ts) to expose functionality
   - Avoid direct imports from other features' internals

2. **Components**
   - Keep components focused and reusable
   - Use CSS Modules for styling
   - Handle loading and error states

3. **Hooks**
   - Encapsulate feature-specific logic
   - Handle state management
   - Provide a clean API for components

4. **Services**
   - Handle API calls and data fetching
   - Implement error handling
   - Keep business logic separate from UI

5. **Types**
   - Define clear interfaces
   - Use TypeScript for type safety
   - Export types through index.ts

## Example

```typescript
// Using the feature in a page
import { ExampleComponent } from '<%= projectImportPath%>features/your-feature';

export default function ExamplePage() {
  return <ExampleComponent />;
}
```
