
import React, { useEffect, useState } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { ThemeToggle } from '../../components/ThemeToggle';
import { useAppDispatch } from '../../store/hooks';
import { useSettings } from '../../hooks/useSettings';
import {
  updateSettingsStart,
  clearError,
  UserSettings,
} from '../../store/slices/settingsSlice';

const currencyOptions = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
];

const dateFormatOptions = [
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (e.g. 31/12/2025)' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (e.g. 12/31/2025)' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (e.g. 2025-12-31)' },
];

export default function SettingsPage() {
  const dispatch = useAppDispatch();
  
  // Use the custom settings hook instead of manual fetch
  const { settings, loading, error } = useSettings();
  
  const [currency, setCurrency] = useState('INR');
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');
  const [monthlyBudget, setMonthlyBudget] = useState(12000);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    // Update local state when settings are loaded from API
    if (settings) {
      setCurrency(settings.currency);
      setDateFormat(settings.dateFormat);
      setMonthlyBudget(settings.monthlyBudget);
    }
  }, [settings]);

  useEffect(() => {
    // Clear error after 5 seconds
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  useEffect(() => {
    // Clear success message after 3 seconds
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleSaveSettings = () => {
    const updatedSettings: Partial<UserSettings> = {
      currency,
      dateFormat,
      monthlyBudget,
    };
    
    dispatch(updateSettingsStart(updatedSettings));
    setSuccessMessage('Settings saved successfully!');
  };

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrency(e.target.value);
  };

  const handleDateFormatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDateFormat(e.target.value);
  };

  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMonthlyBudget(Number(e.target.value));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col">
      <div className="bg-white dark:bg-gray-900">
        <Header />
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-2 py-4 sm:px-4 md:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-4 sm:p-8 w-full max-w-xs sm:max-w-md border border-blue-100 dark:border-gray-700">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-blue-700 dark:text-green-200">Settings</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
              {successMessage}
            </div>
          )}

          <div className="mb-3 sm:mb-4">
            <label className="block text-gray-700 dark:text-gray-200 mb-1">Default Currency</label>
            <select
              className="w-full px-2 py-2 sm:px-3 border border-gray-300 rounded-lg text-sm sm:text-base"
              value={currency}
              onChange={handleCurrencyChange}
              disabled={loading}
            >
              {currencyOptions.map(opt => (
                <option key={opt.code} value={opt.code}>
                  {opt.symbol} - {opt.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3 sm:mb-4">
            <label className="block text-gray-700 dark:text-gray-200 mb-1">Date Format</label>
            <select
              className="w-full px-2 py-2 sm:px-3 border border-gray-300 rounded-lg text-sm sm:text-base"
              value={dateFormat}
              onChange={handleDateFormatChange}
              disabled={loading}
            >
              {dateFormatOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Theme Settings */}
          <div className="mb-4 sm:mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <label className="block text-gray-700 dark:text-gray-200 mb-3 font-medium">Theme Preference</label>
            <ThemeToggle variant="dropdown" size="md" showLabel={false} className="w-full" />
          </div>

          <div className="mb-3 sm:mb-4">
            <label className="block text-gray-700 dark:text-gray-200 mb-1">Monthly Budget</label>
            <input
              type="number"
              min="0"
              className="w-full px-2 py-2 sm:px-3 border border-gray-300 rounded-lg text-sm sm:text-base"
              value={monthlyBudget}
              onChange={handleBudgetChange}
              placeholder="Enter your monthly budget"
              disabled={loading}
            />
          </div>

          <button
            onClick={handleSaveSettings}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
          >
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-900">
        <Footer />
      </div>
    </div>
  );
}