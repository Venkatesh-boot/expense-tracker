
import { call, put, takeLatest } from 'redux-saga/effects';
import API_CONFIG from '../../config/api-config';
import api from '../../utils/api';
import {
  fetchExpensesTableRequest,
  fetchExpensesTableSuccess,
  fetchExpensesTableFailure,
  deleteExpenseRequest,
  deleteExpenseSuccess,
  deleteExpenseFailure,
} from '../slices/expensesTableSlice';


function* handleFetchExpensesTable(): Generator<any, void, any> {
  try {
    const response = yield call(api.get, `${API_CONFIG.EXPENSES}`);
    yield put(fetchExpensesTableSuccess(response.data));
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
}
