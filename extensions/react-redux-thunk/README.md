# React Redux with Redux Toolkit Extension

This extension adds [Redux Toolkit (RTK)](https://redux-toolkit.js.org/) with React Redux bindings to your React application for predictable state management.

## Features

- Redux Toolkit (`configureStore`) with built-in thunk middleware
- Redux Persist for state persistence across sessions
- Redux Logger for development debugging
- Redux DevTools integration (automatic in development)
- TypeScript support with typed `RootState` and `AppDispatch`

## Usage

Redux Toolkit is automatically configured when this extension is added to your project. The extension includes:

- Pre-configured store with `configureStore`
- Redux Persist setup with localStorage
- Redux Logger (development only)
- Typed hooks and store exports
- Root reducer with `combineReducers`

## Key Concepts

- **Store**: Single source of truth for application state
- **Slices**: Bundles of reducers + actions created with `createSlice`
- **Thunks**: Async logic via `createAsyncThunk` (built into RTK)
- **Selectors**: Functions to extract data from the store

## Basic Usage

```tsx
import { useSelector, useDispatch } from 'react-redux';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { RootState, AppDispatch } from './store';

// Create an async thunk
const fetchUser = createAsyncThunk('user/fetch', async (userId: string) => {
  const response = await api.getUser(userId);
  return response.data;
});

// Create a slice
const userSlice = createSlice({
  name: 'user',
  initialState: { data: null, loading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => { state.loading = true; })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      });
  },
});

// Use in components
function UserProfile({ userId }: { userId: string }) {
  const user = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fetchUser(userId));
  }, [userId, dispatch]);

  return <div>{user.data?.name}</div>;
}
```

## Resources

- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [React Redux Documentation](https://react-redux.js.org/)
- [Redux Persist Documentation](https://github.com/rt2zz/redux-persist)
