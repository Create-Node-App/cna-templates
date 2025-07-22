# React Redux with Thunk Extension

This extension adds Redux with Redux Thunk to your React application for predictable state management with support for asynchronous actions.

## Features

- Integration with Redux and Redux Thunk
- Predictable state management
- Async action support
- Time-travel debugging
- Performance optimization
- Development workflow helpers

## Usage

Redux with Thunk is automatically configured when this extension is added to your project. The extension includes:

- Redux store configuration
- Redux Thunk middleware setup
- Action creators and reducers
- React-Redux bindings
- Redux DevTools integration
- TypeScript support

## Key Concepts

- **Store**: Single source of truth for application state
- **Actions**: Plain objects describing what happened
- **Reducers**: Pure functions that specify how state changes
- **Thunks**: Functions that can dispatch actions asynchronously

## Basic Usage

```tsx
import { useSelector, useDispatch } from 'react-redux';

// Thunk action creator
const fetchUser = (userId) => async (dispatch) => {
  dispatch({ type: 'FETCH_USER_START' });
  try {
    const user = await api.getUser(userId);
    dispatch({ type: 'FETCH_USER_SUCCESS', payload: user });
  } catch (error) {
    dispatch({ type: 'FETCH_USER_ERROR', payload: error.message });
  }
};

function UserProfile({ userId }) {
  const user = useSelector(state => state.user);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchUser(userId));
  }, [userId]);

  return <div>{user.name}</div>;
}
```

## Resources

- [Redux Documentation](https://redux.js.org/)
- [Redux Thunk Documentation](https://github.com/reduxjs/redux-thunk)
- [React Redux Documentation](https://react-redux.js.org/) 