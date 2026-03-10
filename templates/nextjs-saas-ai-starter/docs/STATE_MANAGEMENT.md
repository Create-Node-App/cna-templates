# 🗃️ State Management

Next.js SaaS AI Template uses a combination of React Server Components, React Context, and local state. There is no need for a single centralized store.

## Server State (Recommended)

With React Server Components, most data fetching happens on the server:

```typescript
// app/(tenant)/t/[tenant]/page.tsx
import { db } from '@/shared/db';

export default async function TenantDashboard({ params }: Props) {
  const { tenant } = await params;

  // Data is fetched on the server, no client state needed
  const skills = await db.query.skills.findMany({
    where: eq(skills.tenantId, tenant.id),
  });

  return <SkillsList skills={skills} />;
}
```

## Component State

This is the state that only a component needs, and it is not meant to be shared anywhere else. But you can pass it as prop to children components if needed. Most of the time, you want to start from here and lift the state up if needed elsewhere. For this type of state, you will usually need:

- [useState](https://reactjs.org/docs/hooks-reference.html#usestate) - for simpler states that are independent
- [useReducer](https://reactjs.org/docs/hooks-reference.html#usereducer) - for more complex states where on a single action you want to update several pieces of state

## Application State

This is the state that controls interactive parts of an application. Opening modals, notifications, changing color mode, etc. For best performance and maintainability, keep the state as close as possible to the components that are using it. Don't make everything global out of the box.

Our recommendation is to use any of the following state management libraries:

- [jotai](https://github.com/pmndrs/jotai)
- [recoil](https://recoiljs.org/)
- [zustand](https://github.com/pmndrs/zustand)

## Server Cache State

This is the state that comes from the server which is being cached on the client for further usage. It is possible to store remote data inside a state management store such as redux, but there are better solutions for that.

Our recommendation is:

- [react-query](https://react-query.tanstack.com/)

## Form State

This is a state that tracks users inputs in a form.

Forms in React can be [controlled](https://react.dev/reference/react-dom/components/input#controlling-an-input-with-a-state-variable) and [uncontrolled](https://react.dev/reference/react-dom/components/input#reading-the-input-values-when-submitting-a-form).

For complex forms with validation, we recommend:

- [React Hook Form](https://react-hook-form.com/) - Performance-focused form library
- [Zod](https://zod.dev/) - Schema validation (already included)

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

function MyForm() {
  const { register, handleSubmit } = useForm({
    resolver: zodResolver(schema),
  });
  // ...
}
```

## Context State (Multi-tenancy)

Next.js SaaS AI Template uses React Context for tenant information:

```typescript
import { useTenant } from '@/shared/contexts';

function MyComponent() {
  const { tenant } = useTenant();
  return <div>Current tenant: {tenant.name}</div>;
}
```

## Auth State

Authentication state is managed by Auth.js:

```typescript
import { useSession } from 'next-auth/react';
// or
import { useAuth } from '@/features/auth';
```
