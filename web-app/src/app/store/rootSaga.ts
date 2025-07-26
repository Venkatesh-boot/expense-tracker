
import { all } from 'redux-saga/effects';
import registrationSaga from './registrationSaga';
import otpSaga from './otpSaga';

export default function* rootSaga() {
  yield all([
    registrationSaga(),
    otpSaga(),
  ]);
}
