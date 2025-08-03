
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




function* handleFetchExpensesTable(): Generator<any, void, any> {
  try {
    const response = yield call(api.get, `${API_CONFIG.EXPENSES}`);
    // Support paged API: extract content array
    const data = response.data && response.data.content ? response.data.content : [];
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
