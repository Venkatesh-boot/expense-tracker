import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Expense {
  id: string;
  date: string;
  amount: number;
  type: string;
  category: string;
  customCategory?: string;
  description?: string;
  paymentMethod?: string;
  // files?: File[];
}

export interface ExpensesState {
  expenses: Expense[];
  loading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: ExpensesState = {
  expenses: [],
  loading: false,
  error: null,
  success: false,
};

const expensesSlice = createSlice({
  name: 'expenses',
  initialState,
  reducers: {
    addExpenseRequest(state, _action: PayloadAction<Omit<Expense, 'id'>>) {
      state.loading = true;
      state.error = null;
      state.success = false;
    },
    addExpenseSuccess(state, action: PayloadAction<Expense>) {
      state.loading = false;
      state.success = true;
      state.expenses.push(action.payload);
    },
    addExpenseFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
      state.success = false;
    },
    resetExpenseStatus(state) {
      state.success = false;
      state.error = null;
    },
  },
});

export const { addExpenseRequest, addExpenseSuccess, addExpenseFailure, resetExpenseStatus } = expensesSlice.actions;
export default expensesSlice.reducer;
