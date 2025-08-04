import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface DashboardSummary {
  monthlyExpenses: number;
  yearlyExpenses: number;
  monthlyIncome: number;
  monthlySavings: number;
}

export interface MonthlyDetails {
  totalAmount: number;
  avgDaily: number;
  maxDaily: number;
  minDaily: number;
  transactionCount: number;
  categoryBreakdown: Array<{
    name: string;
    value: number;
    percentage: number;
  }>;
  dailyExpenses: Array<{
    day: number;
    amount: number;
  }>;
  previousMonthTotal: number;
  percentChange: number;
  year: number;
  month: number;
  monthName: string;
}

export interface YearlyDetails {
  totalAmount: number;
  avgMonthly: number;
  maxMonthly: number;
  minMonthly: number;
  transactionCount: number;
  categoryBreakdown: Array<{
    name: string;
    value: number;
    percentage: number;
  }>;
  monthlyExpenses: Array<{
    month: string;
    monthNumber: number;
    amount: number;
  }>;
  previousYearTotal: number;
  percentChange: number;
  year: number;
  highestMonth: {
    month: string;
    monthNumber: number;
    amount: number;
  } | null;
  lowestMonth: {
    month: string;
    monthNumber: number;
    amount: number;
  } | null;
}

export interface DashboardState {
  summary: DashboardSummary | null;
  monthlyDetails: MonthlyDetails | null;
  yearlyDetails: YearlyDetails | null;
  loading: boolean;
  loadingMonthlyDetails: boolean;
  loadingYearlyDetails: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  summary: null,
  monthlyDetails: null,
  yearlyDetails: null,
  loading: false,
  loadingMonthlyDetails: false,
  loadingYearlyDetails: false,
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
    fetchMonthlyDetailsStart(state, action: PayloadAction<{ year?: number; month?: number }>) {
      state.loadingMonthlyDetails = true;
      state.error = null;
    },
    fetchMonthlyDetailsSuccess(state, action: PayloadAction<MonthlyDetails>) {
      state.loadingMonthlyDetails = false;
      state.monthlyDetails = action.payload;
      state.error = null;
    },
    fetchMonthlyDetailsFailure(state, action: PayloadAction<string>) {
      state.loadingMonthlyDetails = false;
      state.error = action.payload;
    },
    fetchYearlyDetailsStart(state, action: PayloadAction<{ year?: number }>) {
      state.loadingYearlyDetails = true;
      state.error = null;
    },
    fetchYearlyDetailsSuccess(state, action: PayloadAction<YearlyDetails>) {
      state.loadingYearlyDetails = false;
      state.yearlyDetails = action.payload;
      state.error = null;
    },
    fetchYearlyDetailsFailure(state, action: PayloadAction<string>) {
      state.loadingYearlyDetails = false;
      state.error = action.payload;
    },
  },
});

export const {
  fetchDashboardSummaryStart,
  fetchDashboardSummarySuccess,
  fetchDashboardSummaryFailure,
  fetchMonthlyDetailsStart,
  fetchMonthlyDetailsSuccess,
  fetchMonthlyDetailsFailure,
  fetchYearlyDetailsStart,
  fetchYearlyDetailsSuccess,
  fetchYearlyDetailsFailure,
} = dashboardSlice.actions;
export default dashboardSlice.reducer;
