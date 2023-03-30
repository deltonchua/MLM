import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../app/store';
import { MemberInterface } from '../interfaces/Member';

interface RecruitSliceInterface {
  recruit: MemberInterface | null;
}

const initialState: RecruitSliceInterface = { recruit: null };

export const recruitSlice = createSlice({
  name: 'recruit',
  initialState,
  reducers: {
    setRecruit: (state, action: PayloadAction<MemberInterface | null>) => {
      state.recruit = action.payload;
    },
  },
});

export const { setRecruit } = recruitSlice.actions;

export const selectRecruit = (state: RootState) => state.recruit.recruit;

export default recruitSlice.reducer;
