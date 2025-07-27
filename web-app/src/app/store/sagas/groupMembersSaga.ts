import { call, put, takeLatest } from 'redux-saga/effects';
import {
  fetchMembersRequest,
  fetchMembersSuccess,
  fetchMembersFailure,
  removeMemberRequest,
  removeMemberSuccess,
  removeMemberFailure,
} from '../slices/groupMembersSlice';
import API_CONFIG from '../../config/api-config';
import { PayloadAction } from '@reduxjs/toolkit';

function* fetchMembersSaga(): Generator<unknown, void, unknown> {
  try {
    const response = (yield call(fetch, `${API_CONFIG.BASE_URL}${API_CONFIG.GROUP_MEMBERS}`)) as Response;
    if (!response.ok) {
      const errorText = (yield call([response, 'text'])) as string;
      throw new Error(errorText || 'Failed to fetch members');
    }
    const data = (yield call([response, 'json'])) as Array<{ id: string; name: string; email: string }>;
    yield put(fetchMembersSuccess(data));
  } catch (error: unknown) {
    let message = 'Failed to fetch members';
    if (error instanceof Error) message = error.message;
    yield put(fetchMembersFailure(message));
  }
}

function* removeMemberSaga(action: PayloadAction<{ id: string }>): Generator<unknown, void, unknown> {
  try {
    const response = (yield call(fetch, `${API_CONFIG.BASE_URL}${API_CONFIG.GROUP_MEMBER(action.payload.id)}`, {
      method: 'DELETE',
    })) as Response;
    if (!response.ok) {
      const errorText = (yield call([response, 'text'])) as string;
      throw new Error(errorText || 'Failed to remove member');
    }
    yield put(removeMemberSuccess(action.payload.id));
  } catch (error: unknown) {
    let message = 'Failed to remove member';
    if (error instanceof Error) message = error.message;
    yield put(removeMemberFailure(message));
  }
}

export default function* groupMembersSaga() {
  yield takeLatest(fetchMembersRequest.type, fetchMembersSaga);
  yield takeLatest(removeMemberRequest.type, removeMemberSaga);
}
