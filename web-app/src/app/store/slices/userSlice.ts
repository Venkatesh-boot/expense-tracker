import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  exists: boolean | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  exists: null,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    checkUserExistsRequest(state, _action: PayloadAction<string>) {
      state.loading = true;
      state.error = null;
      state.exists = null;
    },
    checkUserExistsSuccess(state, action: PayloadAction<boolean>) {
      state.loading = false;
      state.exists = action.payload;
    },
    checkUserExistsFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
      state.exists = null;
    },
    resetUserExists(state) {
      state.exists = null;
      state.loading = false;
      state.error = null;
    },
  },
});

export const { checkUserExistsRequest, checkUserExistsSuccess, checkUserExistsFailure, resetUserExists } = userSlice.actions;
export default userSlice.reducer;
