import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../app/store';
import { AuthInterface } from '../interfaces/Auth';

interface AuthSliceInterface {
  auth?: AuthInterface | null;
  chainId?: number;
  address?: string;
  ITO?: string;
}

const initialState: AuthSliceInterface = {};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth: (state, action: PayloadAction<AuthInterface | null>) => {
      state.auth = action.payload;
    },
    setChainId: (state, action: PayloadAction<number | undefined>) => {
      state.chainId = action.payload;
    },
    setAddress: (state, action: PayloadAction<string | undefined>) => {
      state.address = action.payload;
    },
    setITO: (state, action: PayloadAction<string | undefined>) => {
      state.ITO = action.payload;
    },
  },
});

export const { setAuth, setChainId, setAddress, setITO } = authSlice.actions;

export const selectAuth = (state: RootState) => state.auth.auth;
export const selectChainId = (state: RootState) => state.auth.chainId;
export const selectAddress = (state: RootState) => state.auth.address;
export const selectITO = (state: RootState) => state.auth.ITO;

export default authSlice.reducer;
