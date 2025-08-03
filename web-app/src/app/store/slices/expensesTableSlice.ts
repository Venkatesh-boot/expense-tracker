import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ExpensesTableRow {
  id: string;
  date: string;
  category: string;
  amount: number;
  description: string;
}

export interface ExpensesTableState {
  rows: ExpensesTableRow[];
  loading: boolean;
  error: string | null;
}

const initialState: ExpensesTableState = {
  rows: [],
  loading: false,
  error: null,
};


const expensesTableSlice = createSlice({
  name: 'expensesTable',
  initialState,
  reducers: {
    fetchExpensesTableRequest(state) {
      state.loading = true;
      state.error = null;
    },
    fetchExpensesTableSuccess(state, action: PayloadAction<ExpensesTableRow[]>) {
      state.loading = false;
      state.rows = action.payload;
    },
    fetchExpensesTableFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    // Delete expense actions
    deleteExpenseRequest(state, _action: PayloadAction<string>) {
      state.loading = true;
      state.error = null;
    },
    deleteExpenseSuccess(state, action: PayloadAction<string>) {
      state.loading = false;
      state.rows = state.rows.filter(row => row.id !== action.payload);
    },
    deleteExpenseFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  fetchExpensesTableRequest,
  fetchExpensesTableSuccess,
  fetchExpensesTableFailure,
  deleteExpenseRequest,
  deleteExpenseSuccess,
  deleteExpenseFailure,
} = expensesTableSlice.actions;
export default expensesTableSlice.reducer;
