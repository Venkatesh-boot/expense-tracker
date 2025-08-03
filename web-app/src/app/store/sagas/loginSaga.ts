import { call, put, takeLatest } from 'redux-saga/effects';
import { loginRequest, loginSuccess, loginFailure } from '../slices/loginSlice';
import { fetchAccountStart } from '../slices/accountSlice';
import API_CONFIG from '../../config/api-config';
import { PayloadAction } from '@reduxjs/toolkit';


import api from '../../utils/api';

function* handleLogin(action: PayloadAction<{ email?: string; password?: string; countryCode?: string; mobile?: string }>): Generator<unknown, void, unknown> {
  try {
    let response: any;
    if (action.payload.email && action.payload.password) {
      response = (yield call(api.post, API_CONFIG.LOGIN, { email: action.payload.email, password: action.payload.password })) as any;
    } else {
      response = (yield call(api.post, API_CONFIG.LOGIN_MOBILE, { countryCode: action.payload.countryCode, mobile: action.payload.mobile })) as any;
    }
    // Expect token in response.data.token
    const token = response?.data?.token;
    if (token) {
      sessionStorage.setItem('token', token);
    }
    yield put(loginSuccess());
    // Fetch account info after login
    yield put(fetchAccountStart());
  } catch (error: any) {
    let message = 'Login failed';
    if (error?.response?.data) {
      message = typeof error.response.data === 'string' ? error.response.data : error.response.data.message || message;
    } else if (error instanceof Error) {
      message = error.message;
    }
    yield put(loginFailure(message));
  }
}

export default function* loginSaga() {
  yield takeLatest(loginRequest.type, handleLogin);
}
