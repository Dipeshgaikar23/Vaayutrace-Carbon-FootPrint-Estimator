import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import electricityReducer from "./slices/electricitySlice";
import transportReducer from "./slices/transportSlice";
import dashboardReducer from "./slices/dashboardSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    electricity: electricityReducer,
    transport: transportReducer,
    dashboard: dashboardReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;