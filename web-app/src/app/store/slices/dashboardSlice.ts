import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface DashboardSummary {
  monthlyExpenses: number;
  yearlyExpenses: number;
  monthlyIncome: number;
  monthlySavings: number;
}

export interface DashboardState {
  summary: DashboardSummary | null;
  loading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  summary: null,
  loading: false,
  error: null,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    fetchDashboardSummaryStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDashboardSummarySuccess(state, action: PayloadAction<DashboardSummary>) {
      state.loading = false;
      state.summary = action.payload;
      state.error = null;
    },
    fetchDashboardSummaryFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  fetchDashboardSummaryStart,
  fetchDashboardSummarySuccess,
  fetchDashboardSummaryFailure,
} = dashboardSlice.actions;
export default dashboardSlice.reducer;
