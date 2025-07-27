import { call, put, takeLatest } from 'redux-saga/effects';
import { addExpenseRequest, addExpenseSuccess, addExpenseFailure } from '../slices/expensesSlice';
import API_CONFIG from '../../config/api-config';
import { PayloadAction } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';

function* handleAddExpense(action: PayloadAction<any>): Generator<unknown, void, unknown> {
  try {
    // Simulate API call
    const formData = new FormData();
    Object.entries(action.payload).forEach(([key, value]) => {
      if (key === 'files' && Array.isArray(value)) {
        value.forEach((file: File) => formData.append('files', file));
      } else if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });
    const response = (yield call(fetch, `${API_CONFIG.BASE_URL}/expenses`, {
      method: 'POST',
      body: formData,
    })) as Response;
    if (!response.ok) {
      const errorText = (yield call([response, 'text'])) as string;
      throw new Error(errorText || 'Failed to add expense');
    }
    const id = uuidv4();
    yield put(addExpenseSuccess({ ...action.payload, id }));
  } catch (error: unknown) {
    let message = 'Failed to add expense';
    if (error instanceof Error) message = error.message;
    yield put(addExpenseFailure(message));
  }
}

export default function* expensesSaga() {
  yield takeLatest(addExpenseRequest.type, handleAddExpense);
}
