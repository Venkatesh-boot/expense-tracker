import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const user = {
  name: 'John Doe',
  email: 'john@example.com',
  avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=0D8ABC&color=fff',
};

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
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'en');
  const [langDropdown, setLangDropdown] = useState(false);
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
  const langRef = useRef<HTMLDivElement>(null);
  // Sync dark mode on mount and when changed
  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

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
  const navigate = useNavigate();

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value);
    localStorage.setItem('language', e.target.value);
  };

  return (
    <header className="w-full bg-white dark:bg-gray-900 shadow flex items-center justify-between px-6 py-3 mb-6 relative z-40">
      {/* Logo */}
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
        <img src="/favicon.ico" alt="Company Logo" className="h-8 w-8" />
        <span className="font-bold text-xl text-blue-700 dark:text-green-200">ExpenseTracker</span>
      </div>
      {/* User Avatar, Language, Account & Menu */}
      <div className="relative flex items-center gap-4">
        {/* Group Menu */}
        <button
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-green-200 bg-green-50 dark:bg-gray-800 shadow-sm hover:shadow-md transition text-sm font-medium"
          onClick={() => navigate('/group')}
        >
          <svg className="w-5 h-5 text-green-600 dark:text-green-200" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-5a4 4 0 11-8 0 4 4 0 018 0zm6 6v2a2 2 0 01-2 2h-4a2 2 0 01-2-2v-2a2 2 0 012-2h4a2 2 0 012 2z" /></svg>
          <span>Group</span>
        </button>
        {/* Subscription Menu */}
        <button
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50 dark:bg-gray-800 shadow-sm hover:shadow-md transition text-sm font-medium"
          onClick={() => navigate('/subscription')}
        >
          <svg className="w-5 h-5 text-blue-600 dark:text-green-200" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3zm0 10c-4.418 0-8-1.79-8-4V6a2 2 0 012-2h12a2 2 0 012 2v8c0 2.21-3.582 4-8 4z" /></svg>
          <span>Subscription</span>
        </button>
        {/* Custom Language Dropdown */}
        <div className="relative" ref={langRef}>
          <button
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition text-sm font-medium min-w-[110px]"
            onClick={() => setLangDropdown(v => !v)}
            aria-haspopup="listbox"
            aria-expanded={langDropdown}
          >
            <img
              src={`https://flagcdn.com/24x18/${LANGUAGES.find(l => l.code === language)?.country}.png`}
              alt={LANGUAGES.find(l => l.code === language)?.label + ' flag'}
              className="w-5 h-4 rounded-sm border border-gray-200 shadow-sm"
              style={{ objectFit: 'cover' }}
            />
            <span>{LANGUAGES.find(l => l.code === language)?.label}</span>
            <svg className="w-4 h-4 ml-1 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
          </button>
          {langDropdown && (
            <ul className="absolute right-0 mt-2 w-44 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 animate-fade-in" role="listbox">
              {LANGUAGES.map(lang => (
                <li
                  key={lang.code}
                  className={`flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-700 ${language === lang.code ? 'bg-blue-100 dark:bg-gray-900 font-semibold' : ''}`}
                  onClick={() => {
                    setLanguage(lang.code);
                    localStorage.setItem('language', lang.code);
                    setLangDropdown(false);
                  }}
                  role="option"
                  aria-selected={language === lang.code}
                >
                  <img
                    src={`https://flagcdn.com/24x18/${lang.country}.png`}
                    alt={lang.label + ' flag'}
                    className="w-5 h-4 rounded-sm border border-gray-200 shadow-sm"
                    style={{ objectFit: 'cover' }}
                  />
                  <span>{lang.label}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        {/* User Avatar Menu */}
        <img
          src={user.avatar}
          alt="User Avatar"
          className="h-10 w-10 rounded-full border-2 border-blue-200 cursor-pointer"
          onClick={() => setMenuOpen((v) => !v)}
        />
        {menuOpen && (
          <div className="absolute right-0 top-12 bg-white dark:bg-gray-800 rounded-lg shadow-lg w-48 py-2 z-50 animate-fade-in">
            <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
              <div className="font-semibold text-gray-800 dark:text-gray-100">{user.name}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{user.email}</div>
            </div>
            {/* Dark Mode Toggle */}
            <div className="flex items-center justify-between px-4 py-2">
              <span className="text-gray-700 dark:text-gray-200 font-medium">Dark Mode</span>
              <button
                type="button"
                aria-pressed={darkMode}
                onClick={() => setDarkMode((v) => !v)}
                className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors focus:outline-none ${darkMode ? 'bg-green-500' : 'bg-gray-300'}`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-1'}`}
                />
              </button>
            </div>
            <button className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 font-semibold flex items-center gap-2" onClick={() => { setMenuOpen(false); navigate('/account'); }}>
              <span className="inline-block w-5 h-5 text-blue-500">{/* User icon */}
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A9 9 0 1112 21a9 9 0 01-6.879-3.196z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </span>
              Account
            </button>
            <button className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2" onClick={() => { setMenuOpen(false); navigate('/settings'); }}>
              <span className="inline-block w-5 h-5 text-green-500">{/* Settings icon */}
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0a1.724 1.724 0 002.573.982c.797-.46 1.8.149 1.637 1.047a1.724 1.724 0 001.516 2.36c.958.11 1.32 1.36.527 1.82a1.724 1.724 0 00-.002 2.978c.793.46.431 1.71-.527 1.82a1.724 1.724 0 00-1.516 2.36c.163.898-.84 1.507-1.637 1.047a1.724 1.724 0 00-2.573.982c-.3.921-1.603.921-1.902 0a1.724 1.724 0 00-2.573-.982c-.797.46-1.8-.149-1.637-1.047a1.724 1.724 0 00-1.516-2.36c-.958-.11-1.32-1.36-.527-1.82a1.724 1.724 0 00.002-2.978c-.793-.46-.431-1.71.527-1.82a1.724 1.724 0 001.516-2.36c-.163-.898.84-1.507 1.637-1.047.97.56 2.273-.06 2.573-.982z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </span>
              Settings
            </button>
            {showLogout && (
              <button className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600 flex items-center gap-2" onClick={() => { setMenuOpen(false); /* TODO: Add logout logic */ navigate('/login'); }}>
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
