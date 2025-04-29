import { configureStore } from '@reduxjs/toolkit';
import themeReducer from './slices/themeSlice';
import weatherReducer from './slices/weatherSlice';
import newsReducer from './slices/newsSlice';
import financeReducer from './slices/financeSlice';
import widgetsReducer from './slices/widgetsSlice';

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    weather: weatherReducer,
    news: newsReducer,
    finance: financeReducer,
    widgets: widgetsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
