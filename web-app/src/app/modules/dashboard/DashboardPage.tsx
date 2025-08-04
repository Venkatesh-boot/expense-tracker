
import React, { useEffect, useState } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { fetchDashboardSummaryStart, fetchMonthlyDetailsStart } from '../../store/slices/dashboardSlice';
// import ExpenseTable from './ExpenseTable';
import MonthlyCharts from './MonthlyCharts';
import YearlyCharts from './YearlyCharts';

const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState<'monthly' | 'yearly' | 'recent-expenses'>('monthly');
  const navigate = useNavigate();

  // Currency from settings
  const currency = localStorage.getItem('currency') || 'INR';
  const currencySymbols: Record<string, string> = { INR: '₹', USD: '$', EUR: '€', GBP: '£', JPY: '¥' };

  const dispatch = useDispatch();
  const { summary, loading, error } = useSelector((state: RootState) => state.dashboard);

  useEffect(() => {
    dispatch(fetchDashboardSummaryStart());
    
    // If monthly tab is active, fetch monthly details for current month
    if (activeTab === 'monthly') {
      const now = new Date();
      dispatch(fetchMonthlyDetailsStart({ 
        year: now.getFullYear(), 
        month: now.getMonth() + 1 
      }));
    }
  }, [dispatch, activeTab]);

  const handleTabChange = (tab: 'monthly' | 'yearly' | 'recent-expenses') => {
    setActiveTab(tab);
    
    if (tab === 'monthly') {
      const now = new Date();
      dispatch(fetchMonthlyDetailsStart({ 
        year: now.getFullYear(), 
        month: now.getMonth() + 1 
      }));
    }
  };

  const monthlyExpenses = summary?.monthlyExpenses ?? 0;
  const yearlyExpenses = summary?.yearlyExpenses ?? 0;
  const monthlyIncome = summary?.monthlyIncome ?? 0;
  const monthlySavings = summary?.monthlySavings ?? 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Header />
      <div className="flex-1 w-full flex flex-col items-center justify-start px-2 py-4 sm:px-4 md:px-8 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="w-full max-w-xs sm:max-w-lg md:max-w-2xl lg:max-w-4xl">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 text-blue-700 dark:text-green-200">Expense Dashboard</h1>
          {/* Colorful summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="rounded-xl shadow-lg p-4 bg-gradient-to-br from-blue-400 to-blue-600 text-white flex flex-col items-start">
              <div className="flex items-center gap-2 mb-2"><span className="text-2xl">💸</span><span className="font-semibold">Monthly Expenses</span></div>
              <div className="text-2xl font-bold">{currencySymbols[currency] || currency} {monthlyExpenses}</div>
            </div>
            <div className="rounded-xl shadow-lg p-4 bg-gradient-to-br from-green-400 to-green-600 text-white flex flex-col items-start">
              <div className="flex items-center gap-2 mb-2"><span className="text-2xl">📅</span><span className="font-semibold">Yearly Expenses</span></div>
              <div className="text-2xl font-bold">{currencySymbols[currency] || currency} {yearlyExpenses}</div>
            </div>
            <div className="rounded-xl shadow-lg p-4 bg-gradient-to-br from-pink-400 to-pink-600 text-white flex flex-col items-start">
              <div className="flex items-center gap-2 mb-2"><span className="text-2xl">💰</span><span className="font-semibold">Monthly Income</span></div>
              <div className="text-2xl font-bold">{currencySymbols[currency] || currency} {monthlyIncome}</div>
            </div>
            <div className="rounded-xl shadow-lg p-4 bg-gradient-to-br from-purple-400 to-purple-600 text-white flex flex-col items-start">
              <div className="flex items-center gap-2 mb-2"><span className="text-2xl">🏦</span><span className="font-semibold">Monthly Savings</span></div>
              <div className="text-2xl font-bold">{currencySymbols[currency] || currency} {monthlySavings}</div>
            </div>
          </div>
          <div className="mb-6 sm:mb-8">
            <div className="flex border-b mb-3 sm:mb-4">
              <button
                className={`px-2 sm:px-4 py-2 font-semibold focus:outline-none ${activeTab === 'monthly' ? 'border-b-2 border-blue-600 text-blue-700 dark:text-blue-200' : 'text-gray-500 dark:text-gray-300'}`}
                onClick={() => handleTabChange('monthly')}
              >
                Monthly
              </button>
              <button
                className={`px-2 sm:px-4 py-2 font-semibold focus:outline-none ${activeTab === 'yearly' ? 'border-b-2 border-green-600 text-green-700 dark:text-green-200' : 'text-gray-500 dark:text-gray-300'}`}
                onClick={() => handleTabChange('yearly')}
              >
                Yearly
              </button>
              {/* Recent Expenses tab removed, now in ExpensesPage */}
            </div>
            {activeTab === 'monthly' && (
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg shadow p-3 sm:p-6 w-full overflow-x-auto">
                <h2 className="text-lg sm:text-xl font-semibold mb-2 dark:text-blue-200">Monthly Expenses</h2>
                <div className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-300 mb-3 sm:mb-4">{currencySymbols[currency] || currency} {monthlyExpenses}</div>
                <div className="w-full mb-4">
                  <MonthlyCharts />
                </div>
              </div>
            )}
            {activeTab === 'yearly' && (
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg shadow p-3 sm:p-6 w-full overflow-x-auto">
                <h2 className="text-lg sm:text-xl font-semibold mb-2 dark:text-green-200">Yearly Expenses</h2>
                <div className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-300 mb-3 sm:mb-4">{currencySymbols[currency] || currency} {yearlyExpenses}</div>
                <YearlyCharts />
              </div>
            )}
            {/* Recent Expenses tab content moved to ExpensesPage */}
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
