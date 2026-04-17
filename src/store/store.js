import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

import authReducer from "./slices/authSlice";
import popupReducer from "./slices/popupSlice";
import adminReducer from "./slices/adminSlice";
import deadlineReducer from "./slices/deadlineSlice";
import notificationReducer from "./slices/notificationSlice";
import projectReducer from "./slices/projectSlice";
import requestReducer from "./slices/requestSlice";
import studentReducer from "./slices/studentSlice";
import teacherReducer from "./slices/teacherSlice";

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth"], // only auth state will be persisted
};

const rootReducer = combineReducers({
  auth: authReducer,
  popup: popupReducer,
  admin: adminReducer,
  deadline: deadlineReducer,
  notification: notificationReducer,
  project: projectReducer,
  request: requestReducer,
  student: studentReducer,
  teacher: teacherReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // required for redux-persist
    }),
});

export const persistor = persistStore(store);
