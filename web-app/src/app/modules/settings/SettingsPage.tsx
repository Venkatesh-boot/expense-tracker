
import React, { useEffect, useState } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { updateSettingsRequest, loadSettings } from '../../store/slices/settingsSlice';
import type { SettingsState } from '../../store/slices/settingsSlice';

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
  const settings = useAppSelector(state => state.settings as SettingsState);
  const [currency, setCurrency] = useState(settings.currency);
  const [dateFormat, setDateFormat] = useState(settings.dateFormat);
  const [budget, setBudget] = useState(settings.monthlyBudget);

  useEffect(() => {
    // Load from localStorage on mount
    const stored = {
      currency: localStorage.getItem('currency') || 'INR',
      dateFormat: localStorage.getItem('dateFormat') || 'DD/MM/YYYY',
      monthlyBudget: localStorage.getItem('monthlyBudget') || '12000',
    };
    dispatch(loadSettings(stored));
    setCurrency(stored.currency);
    setDateFormat(stored.dateFormat);
    setBudget(stored.monthlyBudget);
  }, [dispatch]);

  useEffect(() => {
    setCurrency(settings.currency);
    setDateFormat(settings.dateFormat);
    setBudget(settings.monthlyBudget);
  }, [settings.currency, settings.dateFormat, settings.monthlyBudget]);

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrency(e.target.value);
    dispatch(updateSettingsRequest({ currency: e.target.value, dateFormat, monthlyBudget: budget }));
    localStorage.setItem('currency', e.target.value);
  };

  const handleDateFormatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDateFormat(e.target.value);
    dispatch(updateSettingsRequest({ currency, dateFormat: e.target.value, monthlyBudget: budget }));
    localStorage.setItem('dateFormat', e.target.value);
  };

  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBudget(e.target.value);
    dispatch(updateSettingsRequest({ currency, dateFormat, monthlyBudget: e.target.value }));
    localStorage.setItem('monthlyBudget', e.target.value);
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col">
      <div className="bg-white dark:bg-gray-900">
        <Header />
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-2 py-4 sm:px-4 md:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-4 sm:p-8 w-full max-w-xs sm:max-w-md border border-blue-100 dark:border-gray-700">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-blue-700 dark:text-green-200">Settings</h2>

          <div className="mb-3 sm:mb-4">
            <label className="block text-gray-700 dark:text-gray-200 mb-1">Default Currency</label>
            <select
              className="w-full px-2 py-2 sm:px-3 border border-gray-300 rounded-lg text-sm sm:text-base"
              value={currency}
              onChange={handleCurrencyChange}
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
            >
              {dateFormatOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="mb-3 sm:mb-4">
            <label className="block text-gray-700 dark:text-gray-200 mb-1">Monthly Budget</label>
            <input
              type="number"
              min="0"
              className="w-full px-2 py-2 sm:px-3 border border-gray-300 rounded-lg text-sm sm:text-base"
              value={budget}
              onChange={handleBudgetChange}
              placeholder="Enter your monthly budget"
            />
          </div>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-900">
        <Footer />
      </div>
    </div>
  );
}