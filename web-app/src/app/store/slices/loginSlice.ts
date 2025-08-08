import { createSlice, PayloadAction } from '@reduxjs/toolkit';


// Allow error to be string or object (for richer API error responses)
export type LoginError = string | { message?: string; [key: string]: any } | null;

export interface LoginState {
  loading: boolean;
  error: LoginError;
  isAuthenticated: boolean;
  email?: string | null;
}

// Check for existing token on initialization
const token = sessionStorage.getItem('token');

const initialState: LoginState = {
  loading: false,
  error: null,
  isAuthenticated: !!token, // Set to true if token exists
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
    loginFailure(state, action: PayloadAction<LoginError>) {
      state.loading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
    },
    logout(state) {
      state.isAuthenticated = false;
      state.error = null;
      state.loading = false;
      state.email = null;
      // Clear token from sessionStorage
      sessionStorage.removeItem('token');
    },
  },
});

export const { loginRequest, loginSuccess, loginFailure, logout } = loginSlice.actions;
export default loginSlice.reducer;
