import { configureStore } from '@reduxjs/toolkit';
import authReducer from './auth/slice';
import passwordReducer from './password/slice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    password: passwordReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 