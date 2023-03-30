import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../app/store';
import { PaymentInterface } from '../interfaces/Product';

interface PaymentSliceInterface {
  history: PaymentInterface[];
}

const initialState: PaymentSliceInterface = {
  history: [],
};

export const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    setPaymentHistory: (state, action: PayloadAction<PaymentInterface[]>) => {
      state.history = action.payload;
    },
  },
});

export const { setPaymentHistory } = paymentSlice.actions;

export const selectPaymentHistory = (state: RootState) => state.payment.history;

export default paymentSlice.reducer;
