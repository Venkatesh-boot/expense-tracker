import { call, put, takeLatest } from 'redux-saga/effects';
import API_CONFIG from '../../config/api-config';
import { fetchExpensesTableRequest, fetchExpensesTableSuccess, fetchExpensesTableFailure } from '../slices/expensesTableSlice';

function* handleFetchExpensesTable(): Generator<any, void, any> {
  try {
    const response = yield call(fetch, `${API_CONFIG.BASE_URL}${API_CONFIG.EXPENSES}`);
    if (!response.ok) throw new Error('Failed to fetch expenses');
    const data = yield response.json();
    yield put(fetchExpensesTableSuccess(data));
  } catch (error: any) {
    yield put(fetchExpensesTableFailure(error.message || 'Unknown error'));
  }
}

export default function* expensesTableSaga() {
  yield takeLatest(fetchExpensesTableRequest.type, handleFetchExpensesTable);
}
