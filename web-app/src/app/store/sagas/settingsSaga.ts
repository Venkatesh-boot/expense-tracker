import { call, put, takeEvery } from 'redux-saga/effects';
import {
  fetchSettingsStart,
  fetchSettingsSuccess,
  fetchSettingsFailure,
  updateSettingsStart,
  updateSettingsSuccess,
  updateSettingsFailure,
  UserSettings,
} from '../slices/settingsSlice';
import API_CONFIG from '../../config/api-config';

const API_BASE_URL = API_CONFIG.BASE_URL;

// API Functions
async function fetchSettingsApi(): Promise<UserSettings> {
  const token = sessionStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}${API_CONFIG.SETTINGS}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to fetch settings' }));
    throw new Error(errorData.message || 'Failed to fetch settings');
  }

  return response.json();
}

async function updateSettingsApi(settings: Partial<UserSettings>): Promise<UserSettings> {
  const token = sessionStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}${API_CONFIG.SETTINGS}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(settings),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to update settings' }));
    throw new Error(errorData.message || 'Failed to update settings');
  }

  return response.json();
}

// Worker Sagas
function* fetchSettingsSaga(): Generator<any, void, any> {
  try {
    const settings: UserSettings = yield call(fetchSettingsApi);
    yield put(fetchSettingsSuccess(settings));
  } catch (error: any) {
    yield put(fetchSettingsFailure(error.message || 'Failed to fetch settings'));
  }
}

function* updateSettingsSaga(action: any): Generator<any, void, any> {
  try {
    const settings: UserSettings = yield call(updateSettingsApi, action.payload);
    yield put(updateSettingsSuccess(settings));
  } catch (error: any) {
    yield put(updateSettingsFailure(error.message || 'Failed to update settings'));
  }
}

// Watcher Sagas
export default function* settingsSaga() {
  yield takeEvery(fetchSettingsStart.type, fetchSettingsSaga);
  yield takeEvery(updateSettingsStart.type, updateSettingsSaga);
}
