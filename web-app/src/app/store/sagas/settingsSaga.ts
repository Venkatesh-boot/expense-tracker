import { call, put, takeLatest } from 'redux-saga/effects';
import { updateSettingsRequest, updateSettingsSuccess, updateSettingsFailure } from '../slices/settingsSlice';
import API_CONFIG from '../../config/api-config';
import { PayloadAction } from '@reduxjs/toolkit';

function* handleUpdateSettings(action: PayloadAction<{ currency: string; dateFormat: string; monthlyBudget: string }>): Generator<unknown, void, unknown> {
  try {
    // Simulate API call
    const response = (yield call(fetch, `${API_CONFIG.BASE_URL}${API_CONFIG.SETTINGS}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(action.payload),
    })) as Response;
    if (!response.ok) {
      const errorText = (yield call([response, 'text'])) as string;
      throw new Error(errorText || 'Failed to update settings');
    }
    yield put(updateSettingsSuccess(action.payload));
  } catch (error: unknown) {
    let message = 'Failed to update settings';
    if (error instanceof Error) message = error.message;
    yield put(updateSettingsFailure(message));
  }
}

export default function* settingsSaga() {
  yield takeLatest(updateSettingsRequest.type, handleUpdateSettings);
}
