import { call, put, takeLatest } from 'redux-saga/effects';
import { verifyOtpRequest, verifyOtpSuccess, verifyOtpFailure } from '../slices/otpSlice';
import API_CONFIG from '../../config/api-config';

interface VerifyOtpAction {
  type: string;
  payload: { otp: string };
}

function* handleVerifyOtp(action: VerifyOtpAction): Generator<unknown, void, unknown> {
  try {
    const response = (yield call(fetch, `${API_CONFIG.BASE_URL}${API_CONFIG.VERIFY_OTP}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(action.payload),
    })) as Response;
    if (!response.ok) {
      const errorText = (yield call([response, 'text'])) as string;
      throw new Error(errorText || 'OTP verification failed');
    }
    yield put(verifyOtpSuccess());
  } catch (error: unknown) {
    let message = 'OTP verification failed';
    if (error instanceof Error) message = error.message;
    yield put(verifyOtpFailure(message));
  }
}

export default function* otpSaga() {
  yield takeLatest(verifyOtpRequest.type, handleVerifyOtp);
}
