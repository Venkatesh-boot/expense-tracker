import { call, put, takeLatest } from 'redux-saga/effects';
import { loginRequest, loginSuccess, loginFailure } from '../slices/loginSlice';
import API_CONFIG from '../../config/api-config';
import { PayloadAction } from '@reduxjs/toolkit';

function* handleLogin(action: PayloadAction<{ email?: string; password?: string; countryCode?: string; mobile?: string }>): Generator<unknown, void, unknown> {
  try {
    let response: Response;
    if (action.payload.email && action.payload.password) {
      response = (yield call(fetch, `${API_CONFIG.BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: action.payload.email, password: action.payload.password }),
      })) as Response;
    } else {
      response = (yield call(fetch, `${API_CONFIG.BASE_URL}/login/mobile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ countryCode: action.payload.countryCode, mobile: action.payload.mobile }),
      })) as Response;
    }
    if (!response.ok) {
      const errorText = (yield call([response, 'text'])) as string;
      throw new Error(errorText || 'Login failed');
    }
    yield put(loginSuccess());
  } catch (error: unknown) {
    let message = 'Login failed';
    if (error instanceof Error) message = error.message;
    yield put(loginFailure(message));
  }
}

export default function* loginSaga() {
  yield takeLatest(loginRequest.type, handleLogin);
}
