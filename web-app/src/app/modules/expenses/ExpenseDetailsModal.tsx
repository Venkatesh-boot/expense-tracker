import React from 'react';

interface ExpenseDetailsModalProps {
  open: boolean;
  onClose: () => void;
  expense: any | null;
}

const ExpenseDetailsModal: React.FC<ExpenseDetailsModalProps> = ({ open, onClose, expense }) => {
  if (!open || !expense) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-6 w-full max-w-md relative border border-blue-200 dark:border-gray-700">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-xl font-bold"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <h2 className="text-2xl font-bold mb-4 text-blue-700 dark:text-blue-200">Expense Details</h2>
        <div className="space-y-2">
          <div><span className="font-semibold">Date:</span> {expense.date}</div>
          <div><span className="font-semibold">Amount:</span> ₹{expense.amount?.toLocaleString()}</div>
          <div><span className="font-semibold">Type:</span> {expense.type}</div>
          <div><span className="font-semibold">Category:</span> {expense.category}{expense.customCategory ? ` (${expense.customCategory})` : ''}</div>
          <div><span className="font-semibold">Payment Method:</span> {expense.paymentMethod}</div>
          <div><span className="font-semibold">Description:</span> {expense.description || <span className="text-gray-400">N/A</span>}</div>
          <div><span className="font-semibold">Created By:</span> {expense.createdBy || <span className="text-gray-400">N/A</span>}</div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseDetailsModal;
