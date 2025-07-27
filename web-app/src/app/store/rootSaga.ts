
import { all } from 'redux-saga/effects';

import registrationSaga from './sagas/registrationSaga';
import otpSaga from './sagas/otpSaga';
import accountSaga from './sagas/accountSaga';

export default function* rootSaga() {
  yield all([
    registrationSaga(),
    otpSaga(),
    accountSaga(),
  ]);
}
