
import { call, put, takeLatest, select } from 'redux-saga/effects';
import API_CONFIG from '../../config/api-config';
import api from '../../utils/api';
import {
  fetchExpensesTableRequest,
  fetchExpensesTableSuccess,
  fetchExpensesTableFailure,
  deleteExpenseRequest,
  deleteExpenseSuccess,
  deleteExpenseFailure,
  updateExpenseRequest,
  updateExpenseSuccess,
  updateExpenseFailure,
} from '../slices/expensesTableSlice';

function* handleUpdateExpense(action: any): Generator<any, void, any> {
  try {
    const { id, data } = action.payload;
    // Get createdBy from account state
    const account = yield select((state: any) => state.account);
    const createdBy = account?.email || 'venkatesh.net5@gmail.com';
    const payloadWithCreatedBy = { ...data, createdBy };
    const response = yield call(api.put, `${API_CONFIG.EXPENSES}/${id}`, payloadWithCreatedBy);
    yield put(updateExpenseSuccess(response.data));
    // Optionally, refetch the table
    yield put(fetchExpensesTableRequest());
  } catch (error: any) {
    yield put(updateExpenseFailure(error.message || 'Failed to update expense'));
  }
}




function* handleFetchExpensesTable(action: any): Generator<any, void, any> {
  try {
    const { fromDate, toDate } = action.payload || {};
    let url = `${API_CONFIG.EXPENSES}`;
    const params = [];
    if (fromDate) params.push(`from=${encodeURIComponent(fromDate)}`);
    if (toDate) params.push(`to=${encodeURIComponent(toDate)}`);
    if (params.length > 0) url += `?${params.join('&')}`;
    const response = yield call(api.get, url);
    // Support paged and unpaged API: extract content array if present, else use data directly
    let data = [];
    if (response.data && Array.isArray(response.data.content)) {
      data = response.data.content;
    } else if (Array.isArray(response.data)) {
      data = response.data;
    } else {
      data = [];
    }
    yield put(fetchExpensesTableSuccess(data));
  } catch (error: any) {
    yield put(fetchExpensesTableFailure(error.message || 'Unknown error'));
  }
}

function* handleDeleteExpense(action: any): Generator<any, void, any> {
  try {
    const id = action.payload;
    yield call(api.delete, `${API_CONFIG.EXPENSES}/${id}`);
    yield put(deleteExpenseSuccess(id));
    // Optionally, refetch the table
    yield put(fetchExpensesTableRequest());
  } catch (error: any) {
    yield put(deleteExpenseFailure(error.message || 'Failed to delete expense'));
  }
}


export default function* expensesTableSaga() {
  yield takeLatest(fetchExpensesTableRequest.type, handleFetchExpensesTable);
  yield takeLatest(deleteExpenseRequest.type, handleDeleteExpense);
  yield takeLatest(updateExpenseRequest.type, handleUpdateExpense);
}
