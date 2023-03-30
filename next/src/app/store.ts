import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import authReducer from '../slices/authSlice';
import userReducer from '../slices/userSlice';
import memberReducer from '../slices/memberSlice';
import commissionReducer from '../slices/commissionSlice';
import payoutReducer from '../slices/payoutSlice';
import recruitReducer from '../slices/recruitSlice';
import cartReducer from '../slices/cartSlice';
import paymentReducer from '../slices/paymentSlice';
import toastReducer from '../slices/toastSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    member: memberReducer,
    commission: commissionReducer,
    payout: payoutReducer,
    recruit: recruitReducer,
    cart: cartReducer,
    payment: paymentReducer,
    toast: toastReducer,
  },
  devTools: process.env.NODE_ENV === 'development',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
