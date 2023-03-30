import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../app/store';
import { PayoutInterface } from '../interfaces/Commission';

interface PayoutSliceInterface {
  history: PayoutInterface[];
}

const initialState: PayoutSliceInterface = {
  history: [],
};

export const payoutSlice = createSlice({
  name: 'payout',
  initialState,
  reducers: {
    setPayoutHistory: (state, action: PayloadAction<PayoutInterface[]>) => {
      state.history = action.payload;
    },
  },
});

export const { setPayoutHistory } = payoutSlice.actions;

export const selectPayoutHistory = (state: RootState) => state.payout.history;

export default payoutSlice.reducer;
