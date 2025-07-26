
import React, { useState } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useNavigate } from 'react-router-dom';
import ExpenseTable from './ExpenseTable';
import MonthlyCharts from './MonthlyCharts';
import YearlyCharts from './YearlyCharts';

const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState<'monthly' | 'yearly' | 'expenses'>('monthly');
  const navigate = useNavigate();

  // Currency from settings
  const currency = localStorage.getItem('currency') || 'INR';
  const currencySymbols: Record<string, string> = { INR: '₹', USD: '$', EUR: '€', GBP: '£', JPY: '¥' };
  // Placeholder data
  const monthlyExpenses = 12345;
  const yearlyExpenses = 98765;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <div className="flex-1 w-full flex flex-col items-center justify-start px-2 py-4 sm:px-4 md:px-8">
        <div className="w-full max-w-xs sm:max-w-lg md:max-w-2xl lg:max-w-4xl bg-white rounded-lg shadow p-3 sm:p-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 text-blue-700">Expense Dashboard</h1>
          {/* Month and Year selection removed; now handled inside MonthlyCharts */}
          <div className="mb-6 sm:mb-8">
            <div className="flex border-b mb-3 sm:mb-4">
              <button
                className={`px-2 sm:px-4 py-2 font-semibold focus:outline-none ${activeTab === 'monthly' ? 'border-b-2 border-blue-600 text-blue-700' : 'text-gray-500'}`}
                onClick={() => setActiveTab('monthly')}
              >
                Monthly
              </button>
              <button
                className={`px-2 sm:px-4 py-2 font-semibold focus:outline-none ${activeTab === 'yearly' ? 'border-b-2 border-green-600 text-green-700' : 'text-gray-500'}`}
                onClick={() => setActiveTab('yearly')}
              >
                Yearly
              </button>
              <button
                className={`px-2 sm:px-4 py-2 font-semibold focus:outline-none ${activeTab === 'expenses' ? 'border-b-2 border-purple-600 text-purple-700' : 'text-gray-500'}`}
                onClick={() => setActiveTab('expenses')}
              >
                Expenses
              </button>
            </div>
            {activeTab === 'monthly' && (
              <div className="bg-gray-50 rounded-lg shadow p-3 sm:p-6 w-full overflow-x-auto">
                <h2 className="text-lg sm:text-xl font-semibold mb-2">Monthly Expenses</h2>
                <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-3 sm:mb-4">{currencySymbols[currency] || currency} {monthlyExpenses}</div>
                <div className="w-full mb-4">
                  <MonthlyCharts />
                </div>
              </div>
            )}
            {activeTab === 'yearly' && (
              <div className="bg-gray-50 rounded-lg shadow p-3 sm:p-6 w-full overflow-x-auto">
                <h2 className="text-lg sm:text-xl font-semibold mb-2">Yearly Expenses</h2>
                <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-3 sm:mb-4">{currencySymbols[currency] || currency} {yearlyExpenses}</div>
                <YearlyCharts />
              </div>
            )}
            {activeTab === 'expenses' && (
              <div className="bg-gray-50 rounded-lg shadow p-3 sm:p-6 w-full overflow-x-auto">
                <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Expenses</h2>
                <ExpenseTable />
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Floating Add Expense Button */}
      <button
        className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center text-2xl sm:text-3xl transition duration-200"
        title="Add Expense"
        onClick={() => navigate('/add-expenses')}
      >
        +
      </button>
      <Footer />
    </div>
  );
};

export default DashboardPage;
