import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import electricityReducer from "./slices/electricitySlice";
import transportReducer from "./slices/transportSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    electricity: electricityReducer,
    transport: transportReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;