import { Route, Routes, Navigate } from 'react-router-dom';
import LoginPage from './modules/login/LoginPage';
import { RequireAuth } from './components/RequireAuth';
import RegistrationPage from './modules/registration/RegistrationPage';
import OtpPage from './modules/otp/OtpPage';
import DashboardPage from './modules/dashboard/DashboardPage';
import AccountPage from './modules/account/AccountPage';
import SettingsPage from './modules/settings/SettingsPage';
import AddExpensesPage from './modules/add-expenses/AddExpensesPage';
import SubscriptionPlans from './modules/subscription/SubscriptionPlans';
import GroupManagementPage from './modules/group/GroupManagementPage';

import ExpensesPage from './modules/expenses/ExpensesPage';
import { Provider } from 'react-redux';
import store from './store/store';
import { ThemeProvider } from './contexts/ThemeContext';
import { useSettings } from './hooks/useSettings';

import React from 'react';

function AppWithSettings() {
  useSettings(); // Safe to call here, inside Provider
  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegistrationPage />} />
        <Route path="/otp" element={<OtpPage />} />
        <Route path="/dashboard" element={<RequireAuth><DashboardPage /></RequireAuth>} />
        <Route path="/expenses" element={<RequireAuth><ExpensesPage /></RequireAuth>} />
        <Route path="/add-expenses" element={<RequireAuth><AddExpensesPage /></RequireAuth>} />
        <Route path="/settings" element={<RequireAuth><SettingsPage /></RequireAuth>} />
        <Route path="/account" element={<RequireAuth><AccountPage /></RequireAuth>} />
        <Route path="/subscription" element={<RequireAuth><SubscriptionPlans /></RequireAuth>} />
        <Route path="/group" element={<RequireAuth><GroupManagementPage /></RequireAuth>} />
      </Routes>
    </div>
  );
}

export function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <AppWithSettings />
      </ThemeProvider>
    </Provider>
  );
}

export default App;
