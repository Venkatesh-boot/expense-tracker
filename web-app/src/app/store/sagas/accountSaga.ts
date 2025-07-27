import { call, put, takeLatest } from 'redux-saga/effects';
import {
  fetchAccountStart,
  fetchAccountSuccess,
  fetchAccountFailure,
  changePasswordStart,
  changePasswordSuccess,
  changePasswordFailure,
} from '../slices/accountSlice';
import api from '../../utils/api';
import API_CONFIG from '../../config/api-config';

import { PayloadAction } from '@reduxjs/toolkit';

function* fetchAccountSaga(): Generator<any, void, any> {
  try {
    // Replace with real API endpoint
    const response = yield call(api.get, API_CONFIG.ACCOUNT);
    yield put(fetchAccountSuccess(response.data));
  } catch (error) {
    yield put(fetchAccountFailure((error as Error).message || 'Failed to fetch account details'));
  }
}

function* changePasswordSaga(action: PayloadAction<{ currentPassword: string; newPassword: string }>): Generator<any, void, any> {
  try {
    // Replace with real API endpoint
    yield call(api.post, API_CONFIG.ACCOUNT_CHANGE_PASSWORD, action.payload);
    yield put(changePasswordSuccess());
  } catch (error) {
    yield put(changePasswordFailure((error as Error).message || 'Failed to change password'));
  }
}

export default function* accountSaga() {
  yield takeLatest(fetchAccountStart.type, fetchAccountSaga);
  yield takeLatest(changePasswordStart.type, changePasswordSaga);
}
