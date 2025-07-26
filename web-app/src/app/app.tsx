

import { Route, Routes, Navigate } from 'react-router-dom';
import LoginPage from './modules/login/LoginPage';
import RegistrationPage from './modules/registration/RegistrationPage';
import OtpPage from './modules/otp/OtpPage';
import { Provider } from 'react-redux';
import store from './store/store';


export function App() {
  return (
    <Provider store={store}>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegistrationPage />} />
        <Route path="/otp" element={<OtpPage />} />
        </Routes>
      </div>
    </Provider>
  );
}

export default App;
