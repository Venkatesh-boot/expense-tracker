

import { Route, Routes, Navigate } from 'react-router-dom';
import LoginPage from './modules/login/LoginPage';
import RegistrationPage from './modules/registration/RegistrationPage';
import OtpPage from './modules/otp/OtpPage';
import DashboardPage from './modules/dashboard/DashboardPage';
import AccountPage from './modules/account/AccountPage';
import SettingsPage from './modules/settings/SettingsPage';
import AddExpensesPage from './modules/add-expenses/AddExpensesPage';
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
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/add-expenses" element={<AddExpensesPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/account" element={<AccountPage />} />
        </Routes>
      </div>
    </Provider>
  );
}

export default App;
