import React, { useState } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

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
  const [currency, setCurrency] = useState(localStorage.getItem('currency') || 'INR');
  const [dateFormat, setDateFormat] = useState(localStorage.getItem('dateFormat') || 'DD/MM/YYYY');

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrency(e.target.value);
    localStorage.setItem('currency', e.target.value);
  };

  const handleDateFormatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDateFormat(e.target.value);
    localStorage.setItem('dateFormat', e.target.value);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <div className="flex-1 flex flex-col items-center justify-center px-2 py-4 sm:px-4 md:px-8">
        <div className="bg-white rounded-lg shadow p-3 sm:p-6 w-full max-w-xs sm:max-w-md">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-blue-700">Settings</h2>
          <div className="mb-3 sm:mb-4">
            <label className="block text-gray-700 mb-1">Default Currency</label>
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
            <label className="block text-gray-700 mb-1">Date Format</label>
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
        </div>
      </div>
      <Footer />
    </div>
  );
}
