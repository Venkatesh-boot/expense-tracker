
import { call, put, takeLatest, select } from 'redux-saga/effects';
import { addExpenseRequest, addExpenseSuccess, addExpenseFailure, getExpenseByIdRequest, getExpenseByIdSuccess, getExpenseByIdFailure } from '../slices/expensesSlice';
import API_CONFIG from '../../config/api-config';
import api from '../../utils/api';
import { PayloadAction } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';

function* handleGetExpenseById(action: PayloadAction<string>): Generator<unknown, void, unknown> {
  try {
    const id = action.payload;
    const response: any = yield call(api.get as any, `${API_CONFIG.EXPENSES}/${id}`);
    yield put(getExpenseByIdSuccess((response as any).data));
  } catch (error: any) {
    let message = 'Failed to fetch expense';
    if (error instanceof Error) message = error.message;
    yield put(getExpenseByIdFailure(message));
  }
}

function* handleAddExpense(action: PayloadAction<any>): Generator<unknown, void, unknown> {
  try {
    // Remove file property if present
    const { file, ...expenseData } = action.payload;
    // Get logged-in user's email from login state
    const email: string | null = (yield select((state: any) => state.login.email)) as any;
    const payloadWithCreatedBy = { ...expenseData, createdBy: email || 'venkatesh.net5@gmail.com' };
    const response: any = yield call(api.post as any, `${API_CONFIG.EXPENSES}`, payloadWithCreatedBy);
    yield put(addExpenseSuccess((response as any).data));
  } catch (error: any) {
    let message = 'Failed to add expense';
    if (error instanceof Error) message = error.message;
    yield put(addExpenseFailure(message));
  }
}

export default function* expensesSaga() {
  yield takeLatest(addExpenseRequest.type, handleAddExpense);
  yield takeLatest(getExpenseByIdRequest.type, handleGetExpenseById);
}
