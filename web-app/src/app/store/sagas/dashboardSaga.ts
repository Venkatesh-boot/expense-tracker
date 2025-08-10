import { call, put, takeLatest } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import api from '../../utils/api';
import API_CONFIG from '../../config/api-config';
import {
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
} from '../slices/dashboardSlice';

function* handleFetchDashboardSummary(): Generator<any, void, any> {
  try {
    const response = yield call(api.get, API_CONFIG.EXPENSES_SUMMARY);
    yield put(fetchDashboardSummarySuccess(response.data));
  } catch (error: any) {
    yield put(fetchDashboardSummaryFailure(error?.message || 'Failed to fetch dashboard summary'));
  }
}

function* handleFetchMonthlyDetails(action: PayloadAction<{ year?: number; month?: number }>): Generator<any, void, any> {
  try {
    const { year, month } = action.payload || {};
    const params = new URLSearchParams();
    if (year) params.append('year', year.toString());
    if (month) params.append('month', month.toString());
    
    const url = `${API_CONFIG.EXPENSES_MONTHLY_DETAILS}${params.toString() ? '?' + params.toString() : ''}`;
    const response = yield call(api.get, url);
    yield put(fetchMonthlyDetailsSuccess(response.data));
  } catch (error: any) {
    yield put(fetchMonthlyDetailsFailure(error?.message || 'Failed to fetch monthly details'));
  }
}

function* handleFetchYearlyDetails(action: PayloadAction<{ year?: number }>): Generator<any, void, any> {
  try {
    const { year } = action.payload || {};
    const params = new URLSearchParams();
    if (year) params.append('year', year.toString());
    
    const url = `${API_CONFIG.EXPENSES_YEARLY_DETAILS}${params.toString() ? '?' + params.toString() : ''}`;
    const response = yield call(api.get, url);
    yield put(fetchYearlyDetailsSuccess(response.data));
  } catch (error: any) {
    yield put(fetchYearlyDetailsFailure(error?.message || 'Failed to fetch yearly details'));
  }
}

function* handleFetchDailyDetails(action: PayloadAction<{ date?: string }>): Generator<any, void, any> {
  try {
    const { date } = action.payload || {};
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    
    const url = `${API_CONFIG.EXPENSES_DAILY_DETAILS}${params.toString() ? '?' + params.toString() : ''}`;
    const response = yield call(api.get, url);
    yield put(fetchDailyDetailsSuccess(response.data));
  } catch (error: any) {
    yield put(fetchDailyDetailsFailure(error?.message || 'Failed to fetch daily details'));
  }
}

function* handleFetchCustomRangeDetails(action: PayloadAction<{ startDate: string; endDate: string }>): Generator<any, void, any> {
  try {
    const { startDate, endDate } = action.payload;
    const params = new URLSearchParams();
    params.append('startDate', startDate);
    params.append('endDate', endDate);
    
    const url = `${API_CONFIG.EXPENSES_CUSTOM_RANGE_DETAILS}?${params.toString()}`;
    const response = yield call(api.get, url);
    yield put(fetchCustomRangeDetailsSuccess(response.data));
  } catch (error: any) {
    yield put(fetchCustomRangeDetailsFailure(error?.message || 'Failed to fetch custom range details'));
  }
}

export default function* dashboardSaga() {
  yield takeLatest(fetchDashboardSummaryStart.type, handleFetchDashboardSummary);
  yield takeLatest(fetchMonthlyDetailsStart.type, handleFetchMonthlyDetails);
  yield takeLatest(fetchYearlyDetailsStart.type, handleFetchYearlyDetails);
  yield takeLatest(fetchDailyDetailsStart.type, handleFetchDailyDetails);
  yield takeLatest(fetchCustomRangeDetailsStart.type, handleFetchCustomRangeDetails);
}
