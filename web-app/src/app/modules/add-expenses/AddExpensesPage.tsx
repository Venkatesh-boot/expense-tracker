
import React from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { categories } from '../../config/categories';
import { paymentMethods } from '../../config/paymentMethods';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { addExpenseRequest, resetExpenseStatus } from '../../store/slices/expensesSlice';
import type { ExpensesState } from '../../store/slices/expensesSlice';


export default function AddExpensesPage() {
  const currency = localStorage.getItem('currency') || 'INR';
  const currencySymbols: Record<string, string> = { INR: '₹', USD: '$', EUR: '€', GBP: '£', JPY: '¥' };
  const [category, setCategory] = React.useState('');
  const [customCategory, setCustomCategory] = React.useState('');
  const [type, setType] = React.useState('expense');
  const [categorySearch, setCategorySearch] = React.useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = React.useState(false);
  const [date, setDate] = React.useState('');
  const [amount, setAmount] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [paymentMethod, setPaymentMethod] = React.useState('');
  const [files, setFiles] = React.useState<File[]>([]);
  const dispatch = useAppDispatch();
  const expenses = useAppSelector(state => state.expenses as ExpensesState);

  const filteredCategories = categories.filter(cat =>
    (cat.type === type || cat.label === 'Other') &&
    cat.label.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const handleCategorySelect = (label: string) => {
    setCategory(label);
    setShowCategoryDropdown(false);
    setCategorySearch('');
    if (label !== 'Other') setCustomCategory('');
  };

  React.useEffect(() => {
    if (expenses.success) {
      setDate('');
      setAmount('');
      setCategory('');
      setCustomCategory('');
      setDescription('');
      setPaymentMethod('');
      setFiles([]);
      dispatch(resetExpenseStatus());
    }
  }, [expenses.success, dispatch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !amount || !type || !category || (category === 'Other' && !customCategory)) return;
    dispatch(addExpenseRequest({
      date,
      amount: Number(amount),
      type,
      category,
      customCategory: category === 'Other' ? customCategory : undefined,
      description,
      paymentMethod,
      files,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Header />
      <div className="flex-1 flex flex-col items-center justify-center px-2 py-4 sm:px-4 md:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-3 sm:p-6 w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-blue-700 dark:text-green-200">Add Daily Expense</h2>
          <form className="space-y-3 sm:space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-gray-700 dark:text-gray-200 mb-1">Date</label>
              <input type="date" className="w-full px-2 py-2 sm:px-3 border border-gray-300 rounded-lg text-sm sm:text-base" value={date} onChange={e => setDate(e.target.value)} required />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-200 mb-1">Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base sm:text-lg">{currencySymbols[currency] || currency}</span>
                <input type="number" className="w-full pl-8 sm:pl-9 pr-2 sm:pr-3 py-2 border border-gray-300 rounded-lg text-sm sm:text-base" min="1" value={amount} onChange={e => setAmount(e.target.value)} required />
              </div>
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-200 mb-1">Type</label>
              <select
                className="w-full px-2 py-2 sm:px-3 border border-gray-300 rounded-lg text-sm sm:text-base"
                value={type}
                onChange={e => setType(e.target.value)}
                required
              >
                <option value="expense">Expense</option>
                <option value="savings">Savings</option>
                <option value="income">Income</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-200 mb-1">Category</label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full px-2 py-2 sm:px-3 border border-gray-300 rounded-lg text-sm sm:text-base"
                  placeholder="Search or select category"
                  value={category ? (categories.find(c => c.label === category)?.icon + ' ' + category) : categorySearch}
                  onChange={e => {
                    setCategory('');
                    setCategorySearch(e.target.value);
                    setShowCategoryDropdown(true);
                  }}
                  onFocus={() => setShowCategoryDropdown(true)}
                  readOnly={category === 'Other'}
                  required
                />
                {showCategoryDropdown && (
                  <ul className="absolute left-0 right-0 max-h-48 overflow-y-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded shadow z-20 mt-1">
                    {filteredCategories.length === 0 && (
                      <li className="px-3 py-2 text-gray-400">No categories found</li>
                    )}
                    {filteredCategories.map(cat => (
                      <li
                        key={cat.label}
                        className={`px-3 py-2 cursor-pointer hover:bg-blue-100 dark:hover:bg-gray-700 flex items-center gap-2 ${category === cat.label ? 'bg-blue-50 dark:bg-gray-800 font-semibold' : ''}`}
                        onClick={() => handleCategorySelect(cat.label)}
                      >
                        <span>{cat.icon}</span> <span>{cat.label}</span>
                      </li>
                    ))}
                    <li
                      className={`px-3 py-2 cursor-pointer hover:bg-blue-100 dark:hover:bg-gray-700 flex items-center gap-2 ${category === 'Other' ? 'bg-blue-50 dark:bg-gray-800 font-semibold' : ''}`}
                      onClick={() => handleCategorySelect('Other')}
                    >
                      <span role="img" aria-label="Add">➕</span> <span>Other (Add Custom)</span>
                    </li>
                  </ul>
                )}
              </div>
              {category === 'Other' && (
                <input
                  type="text"
                  className="mt-2 w-full px-2 py-2 sm:px-3 border border-blue-300 rounded-lg text-sm sm:text-base"
                  placeholder="Enter custom category"
                  value={customCategory}
                  onChange={e => setCustomCategory(e.target.value)}
                  required
                />
              )}
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-200 mb-1">Description</label>
              <input type="text" className="w-full px-2 py-2 sm:px-3 border border-gray-300 rounded-lg text-sm sm:text-base" placeholder="Optional" value={description} onChange={e => setDescription(e.target.value)} />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-200 mb-1">Payment Method</label>
            <select className="w-full px-2 py-2 sm:px-3 border border-gray-300 rounded-lg text-sm sm:text-base" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
              <option value="">Select Method</option>
              {paymentMethods.map(method => (
                <option key={method.value} value={method.value}>
                  {method.icon} {method.label}
                </option>
              ))}
            </select>
            </div>
            {/* Optional file attachment */}
            <div>
              <label className="block text-gray-700 dark:text-gray-200 mb-1">Attach Bills / Files (optional, multiple allowed)</label>
              <input
                type="file"
                className="w-full px-2 py-2 sm:px-3 border border-gray-300 rounded-lg text-sm sm:text-base"
                accept="image/*,application/pdf"
                multiple
                onChange={e => setFiles(Array.from(e.target.files || []))}
              />
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition text-sm sm:text-base" disabled={expenses.loading}>
              {expenses.loading ? 'Adding...' : 'Add Expense'}
            </button>
            {expenses.error && <div className="text-red-500 text-sm mt-2">{expenses.error}</div>}
            {expenses.success && <div className="text-green-600 text-sm mt-2">Expense added successfully!</div>}
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}
