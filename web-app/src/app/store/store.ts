import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import registrationReducer from './registrationSlice';
import otpReducer from './otpSlice';
import accountReducer from './accountSlice';
import accountSaga from './accountSaga';
import rootSaga from './rootSaga';

const sagaMiddleware = createSagaMiddleware();

const store = configureStore({
  reducer: {
    registration: registrationReducer,
    otp: otpReducer,
    account: accountReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({ thunk: false }).concat(sagaMiddleware),
});

sagaMiddleware.run(rootSaga);
sagaMiddleware.run(accountSaga);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
