import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RegistrationFormData } from '../../types/formTypes';

const initialState = {
  loading: false,
  error: null,
  success: false,
};

const registrationSlice = createSlice({
  name: 'registration',
  initialState,
  reducers: {
    registerRequest(state, _action: PayloadAction<RegistrationFormData>) {
      state.loading = true;
      state.error = null;
      state.success = false;
    },
    registerSuccess(state) {
      state.loading = false;
      state.success = true;
    },
    registerFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    resetRegistration(state) {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
  },
});

export const { registerRequest, registerSuccess, registerFailure, resetRegistration } = registrationSlice.actions;
export default registrationSlice.reducer;
