
import React, { useState } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useNavigate } from 'react-router-dom';
import ExpenseTable from './ExpenseTable';
import MonthlyCharts from './MonthlyCharts';
import YearlyCharts from './YearlyCharts';

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DashboardPage = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [activeTab, setActiveTab] = useState<'monthly' | 'yearly' | 'table'>('monthly');
  const navigate = useNavigate();

  // Currency from settings
  const currency = localStorage.getItem('currency') || 'INR';
  const currencySymbols: Record<string, string> = { INR: '₹', USD: '$', EUR: '€', GBP: '£', JPY: '¥' };
  // Placeholder data
  const monthlyExpenses = 12345;
  const yearlyExpenses = 98765;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-4xl font-bold mb-6 text-blue-700">Expense Dashboard</h1>
        <div className="flex gap-4 mb-8">
          <div>
            <label className="block text-gray-700 mb-1">Month</label>
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg"
              value={selectedMonth}
              onChange={e => setSelectedMonth(Number(e.target.value))}
            >
              {months.map((m, idx) => (
                <option key={m} value={idx}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Year</label>
            <input
              type="number"
              className="px-3 py-2 border border-gray-300 rounded-lg"
              value={selectedYear}
              onChange={e => setSelectedYear(Number(e.target.value))}
              min={2000}
              max={2100}
            />
          </div>
        </div>
        <div className="mb-8">
          <div className="flex border-b mb-4">
            <button
              className={`px-4 py-2 font-semibold focus:outline-none ${activeTab === 'monthly' ? 'border-b-2 border-blue-600 text-blue-700' : 'text-gray-500'}`}
              onClick={() => setActiveTab('monthly')}
            >
              Monthly
            </button>
            <button
              className={`px-4 py-2 font-semibold focus:outline-none ${activeTab === 'yearly' ? 'border-b-2 border-green-600 text-green-700' : 'text-gray-500'}`}
              onClick={() => setActiveTab('yearly')}
            >
              Yearly
            </button>
            <button
              className={`px-4 py-2 font-semibold focus:outline-none ${activeTab === 'table' ? 'border-b-2 border-purple-600 text-purple-700' : 'text-gray-500'}`}
              onClick={() => setActiveTab('table')}
            >
              Table
            </button>
          </div>
          {activeTab === 'monthly' && (
            <div className="bg-white rounded-lg shadow p-6 w-full">
              <h2 className="text-xl font-semibold mb-2">Monthly Expenses</h2>
              <div className="text-3xl font-bold text-blue-600 mb-4">{currencySymbols[currency] || currency} {monthlyExpenses}</div>
              <MonthlyCharts />
            </div>
          )}
          {activeTab === 'yearly' && (
            <div className="bg-white rounded-lg shadow p-6 w-full">
              <h2 className="text-xl font-semibold mb-2">Yearly Expenses</h2>
              <div className="text-3xl font-bold text-green-600 mb-4">{currencySymbols[currency] || currency} {yearlyExpenses}</div>
              <YearlyCharts />
            </div>
          )}
          {activeTab === 'table' && (
            <div className="bg-white rounded-lg shadow p-6 w-full">
              <h2 className="text-xl font-semibold mb-4">Expense Table</h2>
              <ExpenseTable />
            </div>
          )}
        </div>
      </div>

      {/* Floating Add Expense Button */}
      <button
        className="fixed bottom-8 right-8 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg w-16 h-16 flex items-center justify-center text-3xl transition duration-200"
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
