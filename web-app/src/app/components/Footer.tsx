import React from 'react';

export default function Footer() {
  return (
    <footer className="w-full bg-white border-t shadow-inner py-4 px-6 flex flex-col md:flex-row items-center justify-between text-sm text-gray-500 mt-8">
      <div className="flex items-center gap-2">
        <img src="/favicon.ico" alt="Company Logo" className="h-6 w-6" />
        <span className="font-semibold text-blue-700">ExpenseTracker</span>
        <span className="ml-2">&copy; {new Date().getFullYear()} All rights reserved.</span>
      </div>
      <div className="flex gap-4 mt-2 md:mt-0">
        <a href="/privacy" className="hover:underline">Privacy Policy</a>
        <a href="/terms" className="hover:underline">Terms of Service</a>
        <a href="mailto:support@expensetracker.com" className="hover:underline">Contact Support</a>
      </div>
    </footer>
  );
}
