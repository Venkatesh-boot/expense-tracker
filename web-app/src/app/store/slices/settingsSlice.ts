import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface SettingsState {
  currency: string;
  dateFormat: string;
  monthlyBudget: string;
  loading: boolean;
  error: string | null;
}

const initialState: SettingsState = {
  currency: 'INR',
  dateFormat: 'DD/MM/YYYY',
  monthlyBudget: '12000',
  loading: false,
  error: null,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    updateSettingsRequest(state, _action: PayloadAction<{ currency: string; dateFormat: string; monthlyBudget: string }>) {
      state.loading = true;
      state.error = null;
    },
    updateSettingsSuccess(state, action: PayloadAction<{ currency: string; dateFormat: string; monthlyBudget: string }>) {
      state.loading = false;
      state.currency = action.payload.currency;
      state.dateFormat = action.payload.dateFormat;
      state.monthlyBudget = action.payload.monthlyBudget;
    },
    updateSettingsFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    loadSettings(state, action: PayloadAction<{ currency: string; dateFormat: string; monthlyBudget: string }>) {
      state.currency = action.payload.currency;
      state.dateFormat = action.payload.dateFormat;
      state.monthlyBudget = action.payload.monthlyBudget;
    },
  },
});

export const { updateSettingsRequest, updateSettingsSuccess, updateSettingsFailure, loadSettings } = settingsSlice.actions;
export default settingsSlice.reducer;
