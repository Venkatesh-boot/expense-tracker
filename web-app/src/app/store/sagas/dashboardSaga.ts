import { call, put, takeLatest } from 'redux-saga/effects';
import api from '../../utils/api';
import API_CONFIG from '../../config/api-config';
import {
  fetchDashboardSummaryStart,
  fetchDashboardSummarySuccess,
  fetchDashboardSummaryFailure,
} from '../slices/dashboardSlice';

function* handleFetchDashboardSummary(): Generator<any, void, any> {
  try {
    const response = yield call(api.get, API_CONFIG.EXPENSES + '/summary');
    yield put(fetchDashboardSummarySuccess(response.data));
  } catch (error: any) {
    yield put(fetchDashboardSummaryFailure(error?.message || 'Failed to fetch dashboard summary'));
  }
}

export default function* dashboardSaga() {
  yield takeLatest(fetchDashboardSummaryStart.type, handleFetchDashboardSummary);
}
