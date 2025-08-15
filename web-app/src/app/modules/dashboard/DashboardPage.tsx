import { currencySymbols } from '../../config/currency-config';
import { formatCurrency } from '../../utils/currencyFormat';
import { useAppSelector } from '../../store/hooks';

import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { RootState } from '../../store/store';
import { fetchDashboardSummaryStart, fetchMonthlyDetailsStart, fetchYearlyDetailsStart, fetchDailyDetailsStart } from '../../store/slices/dashboardSlice';
// import ExpenseTable from './ExpenseTable';
import MonthlyCharts from './MonthlyCharts';
import YearlyCharts from './YearlyCharts';
import DailyCharts from './DailyCharts';
import CustomRangeCharts from './CustomRangeCharts';
import ForecastCharts from './ForecastCharts';

const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState<'daily' | 'monthly' | 'yearly' | 'custom-range' | 'forecast'>('daily');
  const [filteredData, setFilteredData] = useState({
    dailyTotal: 0,
    monthlyTotal: 0,
    yearlyTotal: 0,
    customRangeTotal: 0
  });
  const navigate = useNavigate();

  // Get currency from settings API (Redux store)
  const settings = useAppSelector(state => state.settings.settings);
  const currency = settings?.currency || 'INR';

  const dispatch = useDispatch();
  const { summary, dailyDetails, monthlyDetails, yearlyDetails } = useAppSelector((state: RootState) => state.dashboard);

  useEffect(() => {
    dispatch(fetchDashboardSummaryStart());
    
    // If daily tab is active, fetch daily details for today
    if (activeTab === 'daily') {
      const today = new Date().toISOString().split('T')[0];
      dispatch(fetchDailyDetailsStart({ date: today }));
    } else if (activeTab === 'monthly') {
      const now = new Date();
      dispatch(fetchMonthlyDetailsStart({ 
        year: now.getFullYear(), 
        month: now.getMonth() + 1 
      }));
    } else if (activeTab === 'yearly') {
      const now = new Date();
      dispatch(fetchYearlyDetailsStart({ 
        year: now.getFullYear()
      }));
    }
  }, [dispatch, activeTab]);

  const handleTabChange = (tab: 'daily' | 'monthly' | 'yearly' | 'custom-range' | 'forecast') => {
    setActiveTab(tab);
    
    // Reset filtered data when changing tabs
    setFilteredData({
      dailyTotal: 0,
      monthlyTotal: 0,
      yearlyTotal: 0,
      customRangeTotal: 0
    });
    
    if (tab === 'daily') {
      const today = new Date().toISOString().split('T')[0];
      dispatch(fetchDailyDetailsStart({ date: today }));
    } else if (tab === 'monthly') {
      const now = new Date();
      dispatch(fetchMonthlyDetailsStart({ 
        year: now.getFullYear(), 
        month: now.getMonth() + 1 
      }));
    } else if (tab === 'yearly') {
      const now = new Date();
      dispatch(fetchYearlyDetailsStart({ 
        year: now.getFullYear()
      }));
    }
    // Custom range will be handled by the CustomRangeCharts component
  };

  const monthlyExpenses = summary?.monthlyExpenses ?? 0;
  const yearlyExpenses = summary?.yearlyExpenses ?? 0;
  const monthlyIncome = summary?.monthlyIncome ?? 0;
  const monthlySavings = summary?.monthlySavings ?? 0;
  const dailyExpenses = Math.round(monthlyExpenses / 30); // Estimate daily from monthly

  // Get filtered values based on active tab
  const getFilteredDailyExpenses = () => {
    if (activeTab === 'daily' && filteredData.dailyTotal > 0) {
      return filteredData.dailyTotal;
    }
    if (activeTab === 'daily' && dailyDetails) {
      return dailyDetails.totalAmount;
    }
    return dailyExpenses;
  };

  const getFilteredMonthlyExpenses = () => {
    if (activeTab === 'monthly' && filteredData.monthlyTotal > 0) {
      return filteredData.monthlyTotal;
    }
    if (activeTab === 'monthly' && monthlyDetails) {
      return monthlyDetails.totalAmount;
    }
    return monthlyExpenses;
  };

  const getFilteredYearlyExpenses = () => {
    if (activeTab === 'yearly' && filteredData.yearlyTotal > 0) {
      return filteredData.yearlyTotal;
    }
    if (activeTab === 'yearly' && yearlyDetails) {
      return yearlyDetails.totalAmount;
    }
    return yearlyExpenses;
  };

  // Callback functions for child components to update filtered totals
  const onDailyFilterChange = useCallback((total: number) => {
    setFilteredData(prev => ({ ...prev, dailyTotal: total }));
  }, []);

  const onMonthlyFilterChange = useCallback((total: number) => {
    setFilteredData(prev => ({ ...prev, monthlyTotal: total }));
  }, []);

  const onYearlyFilterChange = useCallback((total: number) => {
    setFilteredData(prev => ({ ...prev, yearlyTotal: total }));
  }, []);

  const onCustomRangeFilterChange = useCallback((total: number) => {
    setFilteredData(prev => ({ ...prev, customRangeTotal: total }));
  }, []);

  // For custom range, we'll show the period-specific data
  const getCustomRangeTitle = () => {
    if (activeTab === 'custom-range') {
      return 'Period Expenses';
    }
    return 'Daily Expenses';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Header />
      <div className="flex-1 w-full flex flex-col items-center justify-start px-2 py-4 sm:px-4 md:px-8 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="w-full max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-4xl">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 text-blue-700 dark:text-green-200">Expense Dashboard</h1>
          <span className="ml-4 text-base font-semibold text-gray-700 dark:text-gray-200">Currency: {currencySymbols[currency] || currency} ({currency})</span>
          {/* Colorful summary cards */}
          <div className="flex sm:grid sm:grid-cols-2 md:grid-cols-5 gap-4 mb-6 overflow-x-auto sm:overflow-visible snap-x snap-mandatory">
            <div className="min-w-[240px] sm:min-w-0 snap-center rounded-xl shadow-lg p-4 bg-gradient-to-br from-purple-400 to-purple-600 text-white flex flex-col items-start">
              <div className="flex items-center gap-2 mb-2"><span className="text-2xl" role="img" aria-label="daily expenses">📊</span><span className="font-semibold">Daily Expenses</span></div>
              <div className="text-2xl font-bold">{formatCurrency(dailyExpenses, currency)}</div>
            </div>
            <div className="min-w-[240px] sm:min-w-0 snap-center rounded-xl shadow-lg p-4 bg-gradient-to-br from-blue-400 to-blue-600 text-white flex flex-col items-start">
              <div className="flex items-center gap-2 mb-2"><span className="text-2xl" role="img" aria-label="monthly expenses">💸</span><span className="font-semibold">Monthly Expenses</span></div>
              <div className="text-2xl font-bold">{formatCurrency(monthlyExpenses, currency)}</div>
            </div>
            <div className="min-w-[240px] sm:min-w-0 snap-center rounded-xl shadow-lg p-4 bg-gradient-to-br from-green-400 to-green-600 text-white flex flex-col items-start">
              <div className="flex items-center gap-2 mb-2"><span className="text-2xl" role="img" aria-label="yearly expenses">📅</span><span className="font-semibold">Yearly Expenses</span></div>
              <div className="text-2xl font-bold">{formatCurrency(yearlyExpenses, currency)}</div>
            </div>
            <div className="min-w-[240px] sm:min-w-0 snap-center rounded-xl shadow-lg p-4 bg-gradient-to-br from-pink-400 to-pink-600 text-white flex flex-col items-start">
              <div className="flex items-center gap-2 mb-2"><span className="text-2xl" role="img" aria-label="monthly income">💰</span><span className="font-semibold">Monthly Income</span></div>
              <div className="text-2xl font-bold">{formatCurrency(monthlyIncome, currency)}</div>
            </div>
            <div className="min-w-[240px] sm:min-w-0 snap-center rounded-xl shadow-lg p-4 bg-gradient-to-br from-indigo-400 to-indigo-600 text-white flex flex-col items-start">
              <div className="flex items-center gap-2 mb-2"><span className="text-2xl" role="img" aria-label="monthly savings">🏦</span><span className="font-semibold">Monthly Savings</span></div>
              <div className="text-2xl font-bold">{formatCurrency(monthlySavings, currency)}</div>
            </div>
          </div>
          <div className="mb-6 sm:mb-8">
            <div className="flex border-b mb-3 sm:mb-4 overflow-x-auto sticky top-16 z-30 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur -mx-2 px-2">
              <button
                className={`px-2 sm:px-4 py-2 font-semibold focus:outline-none whitespace-nowrap ${activeTab === 'daily' ? 'border-b-2 border-purple-600 text-purple-700 dark:text-purple-200' : 'text-gray-500 dark:text-gray-300'}`}
                onClick={() => handleTabChange('daily')}
              >
                Daily
              </button>
              <button
                className={`px-2 sm:px-4 py-2 font-semibold focus:outline-none whitespace-nowrap ${activeTab === 'monthly' ? 'border-b-2 border-blue-600 text-blue-700 dark:text-blue-200' : 'text-gray-500 dark:text-gray-300'}`}
                onClick={() => handleTabChange('monthly')}
              >
                Monthly
              </button>
              <button
                className={`px-2 sm:px-4 py-2 font-semibold focus:outline-none whitespace-nowrap ${activeTab === 'yearly' ? 'border-b-2 border-green-600 text-green-700 dark:text-green-200' : 'text-gray-500 dark:text-gray-300'}`}
                onClick={() => handleTabChange('yearly')}
              >
                Yearly
              </button>
              <button
                className={`px-2 sm:px-4 py-2 font-semibold focus:outline-none whitespace-nowrap ${activeTab === 'custom-range' ? 'border-b-2 border-orange-600 text-orange-700 dark:text-orange-200' : 'text-gray-500 dark:text-gray-300'}`}
                onClick={() => handleTabChange('custom-range')}
              >
                Custom Range
              </button>
              <button
                className={`px-2 sm:px-4 py-2 font-semibold focus:outline-none whitespace-nowrap ${activeTab === 'forecast' ? 'border-b-2 border-purple-600 text-purple-700 dark:text-purple-200' : 'text-gray-500 dark:text-gray-300'}`}
                onClick={() => handleTabChange('forecast')}
              >
                🔮 Forecast
              </button>
            </div>
            {activeTab === 'daily' && (
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg shadow p-3 sm:p-6 w-full overflow-x-auto">
                <h2 className="text-lg sm:text-xl font-semibold mb-2 dark:text-purple-200">Daily Expenses</h2>
                <div className="text-2xl sm:text-3xl font-bold text-purple-600 dark:text-purple-300 mb-3 sm:mb-4">{formatCurrency(getFilteredDailyExpenses(), currency)}</div>
                <div className="w-full mb-4">
                  <DailyCharts onFilterChange={onDailyFilterChange} />
                </div>
              </div>
            )}
            {activeTab === 'monthly' && (
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg shadow p-3 sm:p-6 w-full overflow-x-auto">
                <h2 className="text-lg sm:text-xl font-semibold mb-2 dark:text-blue-200">Monthly Expenses</h2>
                <div className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-300 mb-3 sm:mb-4">{formatCurrency(getFilteredMonthlyExpenses(), currency)}</div>
                <div className="w-full mb-4">
                  <MonthlyCharts onFilterChange={onMonthlyFilterChange} />
                </div>
              </div>
            )}
            {activeTab === 'yearly' && (
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg shadow p-3 sm:p-6 w-full overflow-x-auto">
                <h2 className="text-lg sm:text-xl font-semibold mb-2 dark:text-green-200">Yearly Expenses</h2>
                <div className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-300 mb-3 sm:mb-4">{formatCurrency(getFilteredYearlyExpenses(), currency)}</div>
                <YearlyCharts onFilterChange={onYearlyFilterChange} />
              </div>
            )}
            {activeTab === 'custom-range' && (
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg shadow p-3 sm:p-6 w-full overflow-x-auto">
                <h2 className="text-lg sm:text-xl font-semibold mb-2 dark:text-orange-200">Custom Date Range Analysis</h2>
                <div className="text-2xl sm:text-3xl font-bold text-orange-600 dark:text-orange-300 mb-3 sm:mb-4">{formatCurrency(filteredData.customRangeTotal, currency)}</div>
                <div className="w-full mb-4">
                  <CustomRangeCharts onFilterChange={onCustomRangeFilterChange} />
                </div>
              </div>
            )}
            {activeTab === 'forecast' && (
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg shadow p-3 sm:p-6 w-full overflow-x-auto">
                <h2 className="text-lg sm:text-xl font-semibold mb-2 dark:text-purple-200">Expense Forecasting</h2>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Predict future expenses based on historical data patterns
                </div>
                <div className="w-full mb-4">
                  <ForecastCharts />
                </div>
              </div>
            )}
            {/* Recent Expenses tab content moved to ExpensesPage */}
          </div>
        </div>
      </div>
      {/* Floating Add Expense Button */}
      <button
  className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center text-2xl sm:text-3xl transition duration-200 mb-[env(safe-area-inset-bottom)] mr-[env(safe-area-inset-right)]"
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
