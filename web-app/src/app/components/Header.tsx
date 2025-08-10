import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';

import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { fetchAccountStart } from '../store/slices/accountSlice';
import { logout } from '../store/slices/loginSlice';

// Get user info from Redux
function useUserInfo() {
  const dispatch = useDispatch();
  const account = useSelector((state: RootState) => state.account);
  React.useEffect(() => {
    if (!account.firstName && !account.lastName && !account.email) {
      dispatch(fetchAccountStart());
    }
  }, [dispatch, account.firstName, account.lastName, account.email]);
  const name = (account.firstName || '') + (account.lastName ? ' ' + account.lastName : '');
  const email = account.email || '';
  // Use ui-avatars.com for avatar
  const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || email || 'User')}&background=0D8ABC&color=fff`;
  return { name, email, avatar };
}

// Use SVG flag icons from flagcdn.com (ISO 3166-1 alpha-2 country codes)
const LANGUAGES = [
  { code: 'en', label: 'English', country: 'us' },
  { code: 'fr', label: 'Français', country: 'fr' },
  { code: 'de', label: 'Deutsch', country: 'de' },
  { code: 'es', label: 'Español', country: 'es' },
  { code: 'hi', label: 'हिन्दी', country: 'in' },
];

export default function Header({ showLogout = true }: { showLogout?: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'en');
  const [langDropdown, setLangDropdown] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  React.useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangDropdown(false);
      }
    }
    if (langDropdown) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [langDropdown]);

  const { name, email, avatar } = useUserInfo();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value);
    localStorage.setItem('language', e.target.value);
  };

  // Logout handler function
  const handleLogout = () => {
    setMenuOpen(false);
    // Dispatch Redux logout action to clear authentication state
    dispatch(logout());
    // Clear any remaining storage (logout action already clears sessionStorage)
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <header className="sticky top-0 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b border-gray-200 dark:border-gray-800 shadow flex items-center justify-between px-4 sm:px-6 py-3 mb-6 z-40">
      {/* Logo */}
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
        <img src="/favicon.ico" alt="Company Logo" className="h-8 w-8" />
        <span className="font-bold text-xl text-blue-700 dark:text-blue-200">ExpenseTracker</span>
      </div>
  {/* Desktop Menu */}
  <div className="relative flex items-center gap-4">
        {/* Desktop Nav Buttons - hidden on mobile */}
        <div className="hidden md:flex items-center gap-4">
          <button
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-purple-200 bg-purple-50 dark:bg-gray-800 shadow-sm hover:shadow-md transition text-sm font-medium dark:text-purple-200"
            onClick={() => navigate('/expenses')}
          >
            <svg className="w-5 h-5 text-purple-600 dark:text-purple-200" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M3 12h18M3 17h18" /></svg>
            <span>Expenses</span>
          </button>
          <button
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-green-200 bg-green-50 dark:bg-gray-800 shadow-sm hover:shadow-md transition text-sm font-medium dark:text-green-200"
            onClick={() => navigate('/group')}
          >
            <svg className="w-5 h-5 text-green-600 dark:text-green-200" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-5a4 4 0 11-8 0 4 4 0 018 0zm6 6v2a2 2 0 01-2 2h-4a2 2 0 01-2-2v-2a2 2 0 012-2h4a2 2 0 012 2z" /></svg>
            <span>Group</span>
          </button>
          <button
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50 dark:bg-gray-800 shadow-sm hover:shadow-md transition text-sm font-medium dark:text-blue-200"
            onClick={() => navigate('/subscription')}
          >
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-200" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3zm0 10c-4.418 0-8-1.79-8-4V6a2 2 0 012-2h12a2 2 0 012 2v8c0 2.21-3.582 4-8 4z" /></svg>
            <span>Subscription</span>
          </button>
        </div>
        {/* Hamburger for mobile */}
        <button
          className="block md:hidden p-2 rounded-lg border border-gray-200 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition"
          aria-label="Open menu"
          onClick={() => setMobileMenuOpen((v) => !v)}
        >
          <svg className="w-7 h-7 text-gray-700 dark:text-gray-200" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="absolute right-0 top-14 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-2 z-50 animate-fade-in flex flex-col md:hidden">
            {/* Theme Toggle for Mobile */}
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <ThemeToggle variant="buttons" size="sm" showLabel={true} />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 hover:bg-blue-50 dark:hover:bg-gray-700 text-purple-700 dark:text-purple-200" onClick={() => { setMobileMenuOpen(false); navigate('/expenses'); }}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M3 12h18M3 17h18" /></svg>
              Expenses
            </button>
            <button className="flex items-center gap-2 px-4 py-2 hover:bg-green-50 dark:hover:bg-gray-700 text-green-700 dark:text-green-200" onClick={() => { setMobileMenuOpen(false); navigate('/group'); }}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-5a4 4 0 11-8 0 4 4 0 018 0zm6 6v2a2 2 0 01-2 2h-4a2 2 0 01-2-2v-2a2 2 0 012-2h4a2 2 0 012 2z" /></svg>
              Group
            </button>
            <button className="flex items-center gap-2 px-4 py-2 hover:bg-blue-50 dark:hover:bg-gray-700 text-blue-700 dark:text-blue-200" onClick={() => { setMobileMenuOpen(false); navigate('/subscription'); }}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3zm0 10c-4.418 0-8-1.79-8-4V6a2 2 0 012-2h12a2 2 0 012 2v8c0 2.21-3.582 4-8 4z" /></svg>
              Subscription
            </button>
          </div>
        )}
        {/* Custom Language Dropdown (temporarily hidden) */}
        {/* <div className="relative" ref={langRef}> ...language selector code... </div> */}
        {/* User Avatar Menu */}
        <img
          src={avatar}
          alt="User Avatar"
          className="h-10 w-10 rounded-full border-2 border-blue-200 dark:border-gray-600 cursor-pointer"
          onClick={() => setMenuOpen((v) => !v)}
        />
        {menuOpen && (
          <div className="absolute right-0 top-12 bg-white dark:bg-gray-800 rounded-lg shadow-lg w-48 py-2 z-50 animate-fade-in">
            <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
              <div className="font-semibold text-gray-800 dark:text-gray-100">{name}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{email}</div>
            </div>
            {/* Theme Toggle with proper alignment */}
            <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
              <ThemeToggle variant="dropdown" size="sm" />
            </div>
            <button className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 font-semibold flex items-center gap-2" onClick={() => { setMenuOpen(false); navigate('/account'); }}>
              <span className="inline-block w-5 h-5 text-blue-500 flex-shrink-0">{/* User icon */}
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A9 9 0 1112 21a9 9 0 01-6.879-3.196z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </span>
              Account
            </button>
            <button className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2" onClick={() => { setMenuOpen(false); navigate('/settings'); }}>
              <span className="inline-block w-5 h-5 text-green-500 flex-shrink-0">{/* Settings icon */}
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </span>
              Settings
            </button>
            {showLogout && (
              <button className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600 flex items-center gap-2" onClick={handleLogout}>
                <span className="inline-block w-5 h-5 text-red-500 flex-shrink-0">{/* Logout icon */}
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
