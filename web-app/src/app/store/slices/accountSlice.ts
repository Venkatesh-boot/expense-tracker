import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AccountState {
  name: string;
  email: string;
  mobile: string;
  country: string;
  loading: boolean;
  error: string | null;
  passwordChangeSuccess: boolean;
}

const initialState: AccountState = {
  name: '',
  email: '',
  mobile: '',
  country: '',
  loading: false,
  error: null,
  passwordChangeSuccess: false,
};

const accountSlice = createSlice({
  name: 'account',
  initialState,
  reducers: {
    fetchAccountStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchAccountSuccess(state, action: PayloadAction<{ name: string; email: string; mobile: string; country: string }>) {
      state.loading = false;
      state.error = null;
      state.name = action.payload.name;
      state.email = action.payload.email;
      state.mobile = action.payload.mobile;
      state.country = action.payload.country;
    },
    fetchAccountFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    changePasswordStart(state, _action: PayloadAction<{ currentPassword: string; newPassword: string }>) {
      state.loading = true;
      state.error = null;
      state.passwordChangeSuccess = false;
    },
    changePasswordSuccess(state) {
      state.loading = false;
      state.error = null;
      state.passwordChangeSuccess = true;
    },
    changePasswordFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
      state.passwordChangeSuccess = false;
    },
    clearPasswordChangeStatus(state) {
      state.passwordChangeSuccess = false;
    }
  },
});

export const {
  fetchAccountStart,
  fetchAccountSuccess,
  fetchAccountFailure,
  changePasswordStart,
  changePasswordSuccess,
  changePasswordFailure,
  clearPasswordChangeStatus,
} = accountSlice.actions;
export default accountSlice.reducer;
