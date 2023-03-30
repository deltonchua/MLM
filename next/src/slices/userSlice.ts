import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../app/store';
import { UserInterface } from '../interfaces/User';

interface UserSliceInterface {
  user: UserInterface | null;
}

const initialState: UserSliceInterface = { user: null };

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserInterface | null>) => {
      state.user = action.payload;
    },
  },
});

export const { setUser } = userSlice.actions;

export const selectUser = (state: RootState) => state.user.user;

export default userSlice.reducer;
