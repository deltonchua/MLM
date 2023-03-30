import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../app/store';
import { ToastInterface } from '../interfaces/Toast';

interface ToastSliceInterface {
  toasts: ToastInterface[];
}

const initialState: ToastSliceInterface = { toasts: [] };

export const toastSlice = createSlice({
  name: 'toast',
  initialState,
  reducers: {
    toast: (state, action: PayloadAction<string>) => {
      state.toasts.push({ timestamp: Date.now(), message: action.payload });
    },
    removeToast: (state, action: PayloadAction<number>) => {
      state.toasts = state.toasts.filter((t) => t.timestamp !== action.payload);
    },
  },
});

export const { toast, removeToast } = toastSlice.actions;

export const selectToasts = (state: RootState) => state.toast.toasts;

export default toastSlice.reducer;
