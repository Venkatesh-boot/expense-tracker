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

export default function SettingsPage() {
  const [currency, setCurrency] = useState(localStorage.getItem('currency') || 'INR');

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrency(e.target.value);
    localStorage.setItem('currency', e.target.value);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow p-6 w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-blue-700">Settings</h2>
          <div className="mb-4">
            <label className="block text-gray-700 mb-1">Default Currency</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
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
        </div>
      </div>
      <Footer />
    </div>
  );
}
