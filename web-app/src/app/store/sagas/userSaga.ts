import { call, put, takeLatest } from 'redux-saga/effects';
import API_CONFIG from '../../config/api-config';
import { checkUserExistsRequest, checkUserExistsSuccess, checkUserExistsFailure } from '../slices/userSlice';


function* handleCheckUserExists(action: { type: string; payload: string }): Generator<unknown, void, unknown> {
  try {
    const email = action.payload;
    const response: any = yield call(fetch, `${API_CONFIG.BASE_URL}${API_CONFIG.USER_EXISTS}?email=${encodeURIComponent(email)}`);
    const result: any = yield call(async () => await response.json());
    yield put(checkUserExistsSuccess(result.exists));
  } catch (error) {
    yield put(checkUserExistsFailure('Could not verify user existence.'));
  }
}

export default function* userSaga() {
  yield takeLatest(checkUserExistsRequest.type, handleCheckUserExists);
}
