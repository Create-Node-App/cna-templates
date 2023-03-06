import { CombinedState } from "redux";
import { RouterState } from "connected-react-router";
import { History } from "history";

export type StoreType = CombinedState<{
  router: RouterState<History.LocationState>
}>
