import { call, put, takeLatest } from 'redux-saga/effects';
import { inviteMemberRequest, inviteMemberSuccess, inviteMemberFailure } from '../slices/inviteSlice';
import API_CONFIG from '../../config/api-config';
import { PayloadAction } from '@reduxjs/toolkit';

function* handleInviteMember(action: PayloadAction<{ name: string; email: string }>): Generator<unknown, void, unknown> {
  try {
    const response = (yield call(fetch, `${API_CONFIG.BASE_URL}/group/invite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(action.payload),
    })) as Response;
    if (!response.ok) {
      const errorText = (yield call([response, 'text'])) as string;
      throw new Error(errorText || 'Invitation failed');
    }
    yield put(inviteMemberSuccess());
  } catch (error: unknown) {
    let message = 'Invitation failed';
    if (error instanceof Error) message = error.message;
    yield put(inviteMemberFailure(message));
  }
}

export default function* inviteSaga() {
  yield takeLatest(inviteMemberRequest.type, handleInviteMember);
}
