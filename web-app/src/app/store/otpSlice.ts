import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface OtpState {
  loading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: OtpState = {
  loading: false,
  error: null,
  success: false,
};

export const otpSlice = createSlice({
  name: 'otp',
  initialState,
  reducers: {
    verifyOtpRequest(state, _action: PayloadAction<{ otp: string }>) {
      state.loading = true;
      state.error = null;
      state.success = false;
    },
    verifyOtpSuccess(state) {
      state.loading = false;
      state.success = true;
    },
    verifyOtpFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    resetOtp(state) {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
  },
});

export const { verifyOtpRequest, verifyOtpSuccess, verifyOtpFailure, resetOtp } = otpSlice.actions;
export default otpSlice.reducer;
