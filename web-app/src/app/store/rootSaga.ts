
import { all } from 'redux-saga/effects';


import registrationSaga from './sagas/registrationSaga';
import otpSaga from './sagas/otpSaga';
import accountSaga from './sagas/accountSaga';
import inviteSaga from './sagas/inviteSaga';
import groupMembersSaga from './sagas/groupMembersSaga';


export default function* rootSaga() {
  yield all([
    registrationSaga(),
    otpSaga(),
    accountSaga(),
    inviteSaga(),
    groupMembersSaga(),
  ]);
}
