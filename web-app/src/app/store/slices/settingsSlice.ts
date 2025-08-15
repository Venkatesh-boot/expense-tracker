import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UserSettings {
  userEmail: string;
  currency: string;
  dateFormat: string;
  monthlyBudget: number;
}

interface SettingsState {
  settings: UserSettings | null;
  loading: boolean;
  error: string | null;
  hasFetched: boolean; // Track if settings have been fetched to prevent duplicate API calls
}

const initialState: SettingsState = {
  settings: null,
  loading: false,
  error: null,
  hasFetched: false,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    // Fetch user settings
    fetchSettingsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchSettingsSuccess: (state, action: PayloadAction<UserSettings>) => {
      state.loading = false;
      state.settings = action.payload;
      state.error = null;
      state.hasFetched = true; // Mark as fetched
    },
    fetchSettingsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
      state.hasFetched = true; // Mark as fetched even on failure
    },

    // Update user settings
    updateSettingsStart: (state, action: PayloadAction<Partial<UserSettings>>) => {
      state.loading = true;
      state.error = null;
    },
    updateSettingsSuccess: (state, action: PayloadAction<UserSettings>) => {
      state.loading = false;
      state.settings = action.payload;
      state.error = null;
    },
    updateSettingsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  fetchSettingsStart,
  fetchSettingsSuccess,
  fetchSettingsFailure,
  updateSettingsStart,
  updateSettingsSuccess,
  updateSettingsFailure,
  clearError,
} = settingsSlice.actions;

export default settingsSlice.reducer;
