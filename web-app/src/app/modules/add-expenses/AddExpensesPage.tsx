import React from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const categories = [
  'Food',
  'Transport',
  'Shopping',
  'Bills',
  'Entertainment',
  'Health',
  'Education',
  'Other',
];

export default function AddExpensesPage() {
  const currency = localStorage.getItem('currency') || 'INR';
  const currencySymbols: Record<string, string> = { INR: '₹', USD: '$', EUR: '€', GBP: '£', JPY: '¥' };
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow p-6 w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-blue-700">Add Daily Expense</h2>
          <form className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-1">Date</label>
              <input type="date" className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">{currencySymbols[currency] || currency}</span>
                <input type="number" className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg" min="1" required />
              </div>
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Category</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg" required>
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Description</label>
              <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Optional" />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Payment Method</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option value="">Select Method</option>
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="UPI">UPI</option>
                <option value="NetBanking">Net Banking</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition">Add Expense</button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}
