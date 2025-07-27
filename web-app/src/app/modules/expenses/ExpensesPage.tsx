import React from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ExpensesTable from './ExpensesTable';

const ExpensesPage = () => {
  // Currency from settings
  const currency = localStorage.getItem('currency') || 'INR';
  const currencySymbols: Record<string, string> = { INR: '₹', USD: '$', EUR: '€', GBP: '£', JPY: '¥' };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Header />
      <div className="flex-1 w-full flex flex-col items-center justify-start px-2 py-4 sm:px-4 md:px-8">
        <div className="w-full max-w-xs sm:max-w-lg md:max-w-2xl lg:max-w-4xl bg-white dark:bg-gray-800 rounded-lg shadow p-3 sm:p-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 text-blue-700 dark:text-green-200">All Expenses</h1>
          <ExpensesTable />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ExpensesPage;
