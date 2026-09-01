# 🗃️ State Management

Split state by **where it lives** and **who owns the lifecycle**. React Router v7 gives you server state via loaders/actions — use that before reaching for client stores.

## Server / Route State (preferred)

| Mechanism | Use when |
|-----------|----------|
| **`loader`** | Read data for a URL (DB, API, file) before render |
| **`action`** | Mutate data from forms or non-GET requests |
| **`clientLoader` / `clientAction`** | Browser-only data (localStorage, geolocation) while keeping SSR for the shell |

After an `action`, React Router **revalidates** loaders automatically. Use [`shouldRevalidate`](https://reactrouter.com/route/should-revalidate) when you need finer control.

```typescript
export async function loader() {
  return { items: await db.items.findMany() };
}

export async function action({ request }) {
  const form = await request.formData();
  await db.items.create({ data: Object.fromEntries(form) });
  return { ok: true };
}
```

**Rule of thumb:** if the data is tied to a URL, keep it in the route module.

## UI / Component State

Ephemeral UI (open modals, tabs, hover) belongs in the component:

- [`useState`](https://react.dev/reference/react/useState) — simple local state
- [`useReducer`](https://react.dev/reference/react/useReducer) — multi-field updates in one action

Lift state only when siblings need it — prefer URL search params or a parent route loader over global stores.

## Client Application State

Cross-route UI state (theme, sidebar, toast queue) can use:

- [jotai](https://jotai.org/)
- [zustand](https://github.com/pmndrs/zustand)

Keep stores small and scoped. Do **not** duplicate server data that loaders already provide.

## Remote Cache (client-side fetching)

When the user navigates away from loader-driven pages and you need background sync, consider:

- [TanStack Query](https://tanstack.com/query) with `clientLoader` / manual fetch

Loaders remain the source of truth for SSR; Query handles optimistic updates and polling on the client.

## Form State

Route `action`s pair naturally with `<Form>` and [`useActionData`](https://reactrouter.com/hooks/use-action-data) for validation errors.

For complex multi-step forms, [React Hook Form](https://react-hook-form.com/) still works — submit via `fetcher.Form` or programmatic `useSubmit`.

## Anti-patterns

- ❌ Fetching in `useEffect` what a `loader` could return on first paint
- ❌ Global Redux for data that maps 1:1 to a route URL
- ❌ Storing server secrets in client state or `VITE_` env vars
