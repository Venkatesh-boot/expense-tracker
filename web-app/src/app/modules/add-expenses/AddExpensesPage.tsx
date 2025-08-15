
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchExpensesTableRequest } from '../../store/slices/expensesTableSlice';
import type { ExpensesTableState } from '../../store/slices/expensesTableSlice';

import Header from '../../components/Header';
import { currencySymbols } from '../../config/currency-config';
import Footer from '../../components/Footer';
import { categories } from '../../config/categories';
import { paymentMethods } from '../../config/paymentMethods';
import { expenseTypes } from '../../config/expenseTypes';
import { addExpenseRequest, resetExpenseStatus, getExpenseByIdRequest } from '../../store/slices/expensesSlice';
import { updateExpenseRequest } from '../../store/slices/expensesTableSlice';
import type { ExpensesState, Expense } from '../../store/slices/expensesSlice';
import { ToastContainer, showSuccessToast, showErrorToast } from './toastConfig';

const AddExpensesPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const editId = searchParams.get('id');
  // Get currency from settings API (Redux store)
  const settings = useAppSelector(state => state.settings.settings);
  const currency = settings?.currency || 'INR';
  const [category, setCategory] = React.useState('');
  const [customCategory, setCustomCategory] = React.useState('');
  const [type, setType] = React.useState('EXPENSE');
  const [categorySearch, setCategorySearch] = React.useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = React.useState(false);
  // Preselect today's date in YYYY-MM-DD format unless editing
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const defaultDate = `${yyyy}-${mm}-${dd}`;
  const [date, setDate] = React.useState(defaultDate);
  const [amount, setAmount] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [paymentMethod, setPaymentMethod] = React.useState('UPI');
  const [loadingExpense, setLoadingExpense] = React.useState(false);
  const dispatch = useAppDispatch();
  const expensesTable = useAppSelector(state => state.expensesTable as ExpensesTableState);
  // Redirect to add expense page after successful update (only after update, not on initial load)
  const [wasUpdating, setWasUpdating] = React.useState(false);
  React.useEffect(() => {
    if (editId && expensesTable.loading) {
      setWasUpdating(true);
    }
    if (
      editId &&
      wasUpdating &&
      !expensesTable.loading &&
      !expensesTable.error
    ) {
      setWasUpdating(false);
      navigate('/expenses');
    }
  }, [editId, expensesTable.loading, expensesTable.error, navigate, wasUpdating]);
  const expenses = useAppSelector(state => state.expenses as ExpensesState);
  const expenseById = expenses.expenseById;
  // Fetch expense by id and prefill if editing
  React.useEffect(() => {
    if (editId) {
      setLoadingExpense(true);
      dispatch(getExpenseByIdRequest(editId));
    }
  }, [editId, dispatch]);

  // Prefill form when expenseById is loaded
  React.useEffect(() => {
    if (editId && expenseById) {
      setDate(expenseById.date || '');
      setAmount(expenseById.amount ? expenseById.amount.toString() : '');
      setType(expenseById.type || 'EXPENSE');
      
      // Check if the category exists in predefined categories
      const categoryExists = categories.some(cat => cat.label === expenseById.category);
      
      if (categoryExists) {
        // Predefined category
        setCategory(expenseById.category || '');
        setCustomCategory('');
      } else {
        // Custom category
        setCategory('Other');
        setCustomCategory(expenseById.category || '');
      }
      
      setDescription(expenseById.description || '');
      setPaymentMethod(expenseById.paymentMethod || 'UPI');
      setLoadingExpense(false);
    }
  }, [editId, expenseById]);
  // const [files, setFiles] = React.useState<File[]>([]);
  // dispatch and expenses already declared above
  // Get logged-in user's email (for display or future use if needed)
  // const userEmail = useAppSelector(state => state.login.email);

  const filteredCategories = categories.filter(cat =>
    cat.type.toUpperCase() === type.toUpperCase() &&
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
      showSuccessToast('Expense added successfully!');
      setDate('');
      setAmount('');
      setCategory('');
      setCustomCategory('');
      setDescription('');
      setPaymentMethod('');
      // setFiles([]);
      dispatch(resetExpenseStatus());
    }
  }, [expenses.success, dispatch]);

  React.useEffect(() => {
    if (expenses.error) {
      showErrorToast(expenses.error);
    }
  }, [expenses.error]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !amount || !type || !category || !paymentMethod || (category === 'Other' && !customCategory)) return;
    
    // Use customCategory as the main category when "Other" is selected
    const finalCategory = category === 'Other' ? customCategory : category;
    
    if (editId) {
      dispatch(updateExpenseRequest({
        id: editId,
        data: {
          date,
          amount: Number(amount),
          type,
          category: finalCategory,
          description,
          paymentMethod,
          createdAt: expenseById?.createdAt || undefined,
        },
      }));
    } else {
      dispatch(addExpenseRequest({
        date,
        amount: Number(amount),
        type,
        category: finalCategory,
        description,
        paymentMethod,
        // files,
        // createdBy will be added in saga, not here
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col">
      <ToastContainer />
      <Header />
      <div className="flex-1 flex flex-col items-center justify-center px-2 py-4 sm:px-4 md:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-4 sm:p-8 w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl border border-blue-100 dark:border-gray-700">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 dark:from-blue-300 dark:via-purple-300 dark:to-pink-200">Add Daily Expense</h2>
          <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
            {loadingExpense && (
              <div className="text-blue-600 text-sm mb-2">Loading expense details...</div>
            )}
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
                onChange={e => {
                  setType(e.target.value);
                  setCategory('');
                  setCustomCategory('');
                }}
                required
              >
                {expenseTypes.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-200 mb-1">Category</label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full px-2 py-2 sm:px-3 border border-gray-300 rounded-lg text-sm sm:text-base"
                  placeholder="Search or select category"
                  value={category ? (category === 'Other' ? '➕ Other' : (categories.find(c => c.label === category)?.icon + ' ' + category)) : categorySearch}
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
                    {filteredCategories.length === 0 && categorySearch && (
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
            <select className="w-full px-2 py-2 sm:px-3 border border-gray-300 rounded-lg text-sm sm:text-base" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} required>
              <option value="">Select Method</option>
              {paymentMethods.map(method => (
                <option key={method.value} value={method.value}>
                  {method.icon} {method.label}
                </option>
              ))}
            </select>
            </div>
            {/* File upload temporarily hidden */}
            {/*
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
            */}
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white font-semibold py-2 rounded-lg shadow transition text-sm sm:text-base border-0"
                disabled={expenses.loading}
              >
                {expenses.loading
                  ? (editId ? 'Updating...' : 'Adding...')
                  : (editId ? 'Update Expense' : 'Add Expense')}
              </button>
              <button
                type="button"
                className="flex-1 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-300 dark:from-gray-700 dark:via-gray-800 dark:to-gray-900 text-gray-800 dark:text-gray-200 font-semibold py-2 rounded-lg shadow transition text-sm sm:text-base border border-gray-300 dark:border-gray-700"
                onClick={() => {
                  setDate('');
                  setAmount('');
                  setCategory('');
                  setCustomCategory('');
                  setDescription('');
                  setPaymentMethod('');
                  // setFiles([]);
                  dispatch(resetExpenseStatus());
                }}
              >
                Clear All
              </button>
            </div>
            {/* Toast notifications handle success and error messages */}
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AddExpensesPage;