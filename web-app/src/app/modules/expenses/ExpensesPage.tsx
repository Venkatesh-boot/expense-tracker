import React from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ExpensesTable from './ExpensesTable';

const ExpensesPage = () => {
  // Currency from settings
  const currency = localStorage.getItem('currency') || 'INR';
  const currencySymbols: Record<string, string> = { INR: '₹', USD: '$', EUR: '€', GBP: '£', JPY: '¥' };

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col">
      <Header />
      <div className="flex-1 w-full max-w-full flex flex-col items-center justify-start px-0 sm:px-4 md:px-8 py-2 sm:py-4 overflow-x-hidden">
        <div className="w-full max-w-full sm:max-w-lg md:max-w-2xl lg:max-w-4xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-2 sm:p-8 border border-blue-100 dark:border-gray-700 overflow-x-auto">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 dark:from-blue-300 dark:via-purple-300 dark:to-pink-200">All Expenses</h1>
          <ExpensesTable />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ExpensesPage;
