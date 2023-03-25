import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import { History } from 'history';

export default (history: History) =>
  combineReducers({
    // connected react router reducer with history binding
    router: connectRouter(history),

    // Add your custom reducers here
  });
