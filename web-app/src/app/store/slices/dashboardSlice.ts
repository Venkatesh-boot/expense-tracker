import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface DashboardSummary {
  monthlyExpenses: number;
  yearlyExpenses: number;
  monthlyIncome: number;
  monthlySavings: number;
}

export interface RecurringExpense {
  name: string;
  amount: number;
  category?: string;
  frequency?: string;
}

export interface MonthlyDetails {
  totalAmount: number;
  totalExpenses: number;
  totalIncome: number;
  totalSavings: number;
  netIncome: number;
  savingsRate: number;
  avgDaily: number;
  maxDaily: number;
  minDaily: number;
  transactionCount: number;
  incomeTransactionCount: number;
  savingsTransactionCount: number;
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
  previousMonthExpenses: number;
  previousMonthIncome: number;
  previousMonthSavings: number;
  percentChange: number;
  expensePercentChange: number;
  incomePercentChange: number;
  savingsPercentChange: number;
  year: number;
  month: number;
  monthName: string;
  monthlyBudget: number;
  budgetUsed: number;
  budgetRemaining: number;
  recurringExpenses: RecurringExpense[];
}

export interface YearlyDetails {
  totalAmount: number;
  totalExpenses: number;
  totalIncome: number;
  totalSavings: number;
  netIncome: number;
  savingsRate: number;
  avgMonthly: number;
  maxMonthly: number;
  minMonthly: number;
  transactionCount: number;
  incomeTransactionCount: number;
  savingsTransactionCount: number;
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
  previousYearExpenses: number;
  previousYearIncome: number;
  previousYearSavings: number;
  percentChange: number;
  expensePercentChange: number;
  incomePercentChange: number;
  savingsPercentChange: number;
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
  yearlyBudget: number;
  budgetUsed: number;
  budgetRemaining: number;
  recurringExpenses: RecurringExpense[];
}

export interface DailyDetails {
  totalAmount: number;
  avgHourly: number;
  maxHourly: number;
  minHourly: number;
  transactionCount: number;
  categoryBreakdown: Array<{
    name: string;
    value: number;
    percentage: number;
  }>;
  hourlyExpenses: Array<{
    hour: number;
    amount: number;
  }>;
  previousDayTotal: number;
  percentChange: number;
  date: string;
  dayName: string;
  dailyBudget: number;
  budgetUsed: number;
  budgetRemaining: number;
  topExpenseCategory: string;
  expensesByTimeOfDay: {
    morning: number; // 6-12
    afternoon: number; // 12-18
    evening: number; // 18-22
    night: number; // 22-6
  };
}

export interface CustomRangeDetails {
  totalAmount: number;
  totalExpenses: number;
  totalIncome: number;
  totalSavings: number;
  netIncome: number;
  avgDaily: number;
  maxDaily: number;
  minDaily: number;
  transactionCount: number;
  incomeTransactionCount: number;
  savingsTransactionCount: number;
  categoryBreakdown: Array<{
    name: string;
    value: number;
    percentage: number;
  }>;
  dailyExpenses: Array<{
    date: string;
    amount: number;
    dayName: string;
  }>;
  startDate: string;
  endDate: string;
  dayCount: number;
  topExpenseDay: {
    date: string;
    amount: number;
    dayName: string;
  } | null;
  lowestExpenseDay: {
    date: string;
    amount: number;
    dayName: string;
  } | null;
  mostActiveCategory: string;
  averagePerCategory: Array<{
    category: string;
    avgAmount: number;
    totalAmount: number;
    transactionCount: number;
  }>;
}

export interface DashboardState {
  summary: DashboardSummary | null;
  monthlyDetails: MonthlyDetails | null;
  yearlyDetails: YearlyDetails | null;
  dailyDetails: DailyDetails | null;
  customRangeDetails: CustomRangeDetails | null;
  loading: boolean;
  loadingMonthlyDetails: boolean;
  loadingYearlyDetails: boolean;
  loadingDailyDetails: boolean;
  loadingCustomRangeDetails: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  summary: null,
  monthlyDetails: null,
  yearlyDetails: null,
  dailyDetails: null,
  customRangeDetails: null,
  loading: false,
  loadingMonthlyDetails: false,
  loadingYearlyDetails: false,
  loadingDailyDetails: false,
  loadingCustomRangeDetails: false,
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
    fetchDailyDetailsStart(state, action: PayloadAction<{ date?: string }>) {
      state.loadingDailyDetails = true;
      state.error = null;
    },
    fetchDailyDetailsSuccess(state, action: PayloadAction<DailyDetails>) {
      state.loadingDailyDetails = false;
      state.dailyDetails = action.payload;
      state.error = null;
    },
    fetchDailyDetailsFailure(state, action: PayloadAction<string>) {
      state.loadingDailyDetails = false;
      state.error = action.payload;
    },
    fetchCustomRangeDetailsStart(state, action: PayloadAction<{ startDate: string; endDate: string }>) {
      state.loadingCustomRangeDetails = true;
      state.error = null;
    },
    fetchCustomRangeDetailsSuccess(state, action: PayloadAction<CustomRangeDetails>) {
      state.loadingCustomRangeDetails = false;
      state.customRangeDetails = action.payload;
      state.error = null;
    },
    fetchCustomRangeDetailsFailure(state, action: PayloadAction<string>) {
      state.loadingCustomRangeDetails = false;
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
  fetchDailyDetailsStart,
  fetchDailyDetailsSuccess,
  fetchDailyDetailsFailure,
  fetchCustomRangeDetailsStart,
  fetchCustomRangeDetailsSuccess,
  fetchCustomRangeDetailsFailure,
} = dashboardSlice.actions;
export default dashboardSlice.reducer;
