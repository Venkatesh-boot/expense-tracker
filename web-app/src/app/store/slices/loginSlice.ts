import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface LoginState {
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  email?: string | null;
}

const initialState: LoginState = {
  loading: false,
  error: null,
  isAuthenticated: false,
  email: null,
};

const loginSlice = createSlice({
  name: 'login',
  initialState,
  reducers: {
    loginRequest(state, action: PayloadAction<{ email?: string; password?: string; countryCode?: string; mobile?: string }>) {
      state.loading = true;
      state.error = null;
      state.isAuthenticated = false;
      if (action.payload.email) {
        state.email = action.payload.email;
      } else {
        state.email = null;
      }
    },
    loginSuccess(state) {
      state.loading = false;
      state.isAuthenticated = true;
    },
    loginFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
    },
    logout(state) {
      state.isAuthenticated = false;
      state.error = null;
      state.loading = false;
      state.email = null;
    },
  },
});

export const { loginRequest, loginSuccess, loginFailure, logout } = loginSlice.actions;
export default loginSlice.reducer;
