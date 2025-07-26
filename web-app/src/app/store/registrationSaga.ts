
import { call, put, takeLatest } from 'redux-saga/effects';
import { registerRequest, registerSuccess, registerFailure } from './registrationSlice';
import API_CONFIG from '../config/api-config';


import type { RegistrationFormData } from '../types/formTypes';
interface RegisterAction {
  type: string;
  payload: RegistrationFormData;
}

function* handleRegister(action: RegisterAction): Generator<unknown, void, unknown> {
  try {
    const response = (yield call(fetch, `${API_CONFIG.BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(action.payload),
    })) as Response;
    if (!response.ok) {
      const errorText = (yield call([response, 'text'])) as string;
      throw new Error(errorText || 'Registration failed');
    }
    yield put(registerSuccess());
  } catch (error: unknown) {
    let message = 'Registration failed';
    if (error instanceof Error) message = error.message;
    yield put(registerFailure(message));
  }
}

export default function* registrationSaga() {
  yield takeLatest(registerRequest.type, handleRegister);
}
