import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AccountState {
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  countryCode: string;
  loading: boolean;
  error: string | null;
  passwordChangeSuccess: boolean;
}

const initialState: AccountState = {
  firstName: '',
  lastName: '',
  email: '',
  mobile: '',
  countryCode: '',
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
    fetchAccountSuccess(state, action: PayloadAction<{ firstName: string; lastName: string; email: string; mobile: string; countryCode: string }>) {
      state.loading = false;
      state.error = null;
      state.firstName = action.payload.firstName;
      state.lastName = action.payload.lastName;
      state.email = action.payload.email;
      state.mobile = action.payload.mobile;
      state.countryCode = action.payload.countryCode;
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
