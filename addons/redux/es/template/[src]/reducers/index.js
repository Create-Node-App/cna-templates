import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';

export default (history) =>
  combineReducers({
    // connected react router reducer with history binding
    router: connectRouter(history),

    // Add your custom reducers here
  });
