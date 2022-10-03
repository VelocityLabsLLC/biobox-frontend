import dataReducer from "./data";
import sidebarReducer from "./sidebar";

import { combineReducers } from "redux";

// combine reducers
export default combineReducers({
  dataReducer,
  sidebarReducer,
});
