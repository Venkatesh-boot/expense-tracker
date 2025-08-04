import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';

import registrationReducer from './slices/registrationSlice';
import userReducer from './slices/userSlice';
import otpReducer from './slices/otpSlice';
import accountReducer from './slices/accountSlice';
import dashboardReducer from './slices/dashboardSlice';
import rootSaga from './rootSaga';

const sagaMiddleware = createSagaMiddleware();

const store = configureStore({
  reducer: {
    registration: registrationReducer,
    otp: otpReducer,
    account: accountReducer,
    invite: require('./slices/inviteSlice').default,
    groupMembers: require('./slices/groupMembersSlice').default,
    login: require('./slices/loginSlice').default,
    settings: require('./slices/settingsSlice').default,
    expenses: require('./slices/expensesSlice').default,
    expensesTable: require('./slices/expensesTableSlice').default,
    user: userReducer,
    dashboard: dashboardReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({ thunk: false }).concat(sagaMiddleware),
});

sagaMiddleware.run(rootSaga);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
