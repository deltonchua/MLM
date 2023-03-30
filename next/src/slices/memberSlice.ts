import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../app/store';
import { MemberInterface } from '../interfaces/Member';

interface MemberSliceInterface {
  member: MemberInterface | null;
}

const initialState: MemberSliceInterface = { member: null };

export const memberSlice = createSlice({
  name: 'member',
  initialState,
  reducers: {
    setMember: (state, action: PayloadAction<MemberInterface | null>) => {
      state.member = action.payload;
    },
  },
});

export const { setMember } = memberSlice.actions;

export const selectMember = (state: RootState) => state.member.member;

export default memberSlice.reducer;
