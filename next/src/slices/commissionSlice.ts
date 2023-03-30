import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../app/store';
import { CommissionInterface } from '../interfaces/Commission';

interface CommissionSliceInterface {
  history: CommissionInterface[];
}

const initialState: CommissionSliceInterface = {
  history: [],
};

export const commissionSlice = createSlice({
  name: 'commission',
  initialState,
  reducers: {
    setCommissionHistory: (
      state,
      action: PayloadAction<CommissionInterface[]>
    ) => {
      state.history = action.payload;
    },
  },
});

export const { setCommissionHistory } = commissionSlice.actions;

export const selectCommissionHistory = (state: RootState) =>
  state.commission.history;

export default commissionSlice.reducer;
