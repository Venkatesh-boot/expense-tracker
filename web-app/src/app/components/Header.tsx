import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const user = {
  name: 'John Doe',
  email: 'john@example.com',
  avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=0D8ABC&color=fff',
};

export default function Header({ showLogout = true }: { showLogout?: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="w-full bg-white shadow flex items-center justify-between px-6 py-3 mb-6 relative z-40">
      {/* Logo */}
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
        <img src="/favicon.ico" alt="Company Logo" className="h-8 w-8" />
        <span className="font-bold text-xl text-blue-700">ExpenseTracker</span>
      </div>
      {/* User Avatar, Account & Menu */}
      <div className="relative flex items-center gap-4">
        {/* User Avatar Menu */}
        <img
          src={user.avatar}
          alt="User Avatar"
          className="h-10 w-10 rounded-full border-2 border-blue-200 cursor-pointer"
          onClick={() => setMenuOpen((v) => !v)}
        />
        {menuOpen && (
          <div className="absolute right-0 top-12 bg-white rounded-lg shadow-lg w-48 py-2 z-50 animate-fade-in">
            <div className="px-4 py-2 border-b">
              <div className="font-semibold">{user.name}</div>
              <div className="text-xs text-gray-500">{user.email}</div>
            </div>
            <button className="w-full text-left px-4 py-2 hover:bg-gray-100 font-semibold flex items-center gap-2" onClick={() => { setMenuOpen(false); navigate('/account'); }}>
              <span className="inline-block w-5 h-5 text-blue-500">{/* User icon */}
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A9 9 0 1112 21a9 9 0 01-6.879-3.196z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </span>
              Account
            </button>
            <button className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2" onClick={() => { setMenuOpen(false); navigate('/settings'); }}>
              <span className="inline-block w-5 h-5 text-green-500">{/* Settings icon */}
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0a1.724 1.724 0 002.573.982c.797-.46 1.8.149 1.637 1.047a1.724 1.724 0 001.516 2.36c.958.11 1.32 1.36.527 1.82a1.724 1.724 0 00-.002 2.978c.793.46.431 1.71-.527 1.82a1.724 1.724 0 00-1.516 2.36c.163.898-.84 1.507-1.637 1.047a1.724 1.724 0 00-2.573.982c-.3.921-1.603.921-1.902 0a1.724 1.724 0 00-2.573-.982c-.797.46-1.8-.149-1.637-1.047a1.724 1.724 0 00-1.516-2.36c-.958-.11-1.32-1.36-.527-1.82a1.724 1.724 0 00.002-2.978c-.793-.46-.431-1.71.527-1.82a1.724 1.724 0 001.516-2.36c-.163-.898.84-1.507 1.637-1.047.97.56 2.273-.06 2.573-.982z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </span>
              Settings
            </button>
            {showLogout && (
              <button className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600 flex items-center gap-2" onClick={() => { setMenuOpen(false); /* TODO: Add logout logic */ navigate('/login'); }}>
                <span className="inline-block w-5 h-5 text-red-500">{/* Logout icon */}
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" /></svg>
                </span>
                Logout
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
