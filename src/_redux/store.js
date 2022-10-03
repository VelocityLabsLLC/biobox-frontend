import { createStore } from "redux";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // defaults to localStorage for web
import { composeWithDevTools } from "redux-devtools-extension";
import allReducers from "./reducers";

const persistConfig = {
  key: "user",
  storage: storage,
  whitelist: ["dataReducer"], // which reducer want to store
};

const persistedReducer = persistReducer(persistConfig, allReducers);
const store =
  process.env.NODE_ENV === "development"
    ? createStore(persistedReducer, composeWithDevTools())
    : createStore(persistedReducer);
const persistor = persistStore(store);

export { store, persistor };
