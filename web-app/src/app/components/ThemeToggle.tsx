import React from 'react';
import { useTheme, Theme } from '../contexts/ThemeContext';

interface ThemeToggleProps {
  variant?: 'toggle' | 'dropdown' | 'buttons';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  variant = 'toggle', 
  size = 'md', 
  showLabel = true,
  className = '' 
}) => {
  const { theme, effectiveTheme, setTheme, toggleTheme } = useTheme();

  const sizeClasses = {
    sm: 'h-5 w-10',
    md: 'h-6 w-12',
    lg: 'h-7 w-14'
  };

  const knobSizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  const translateClasses = {
    sm: effectiveTheme === 'dark' ? 'translate-x-5' : 'translate-x-0.5',
    md: effectiveTheme === 'dark' ? 'translate-x-6' : 'translate-x-1',
    lg: effectiveTheme === 'dark' ? 'translate-x-7' : 'translate-x-1'
  };

  if (variant === 'dropdown') {
    return (
      <div className={`flex items-center justify-between ${className}`}>
        {showLabel && (
          <span className="text-gray-700 dark:text-gray-200 font-medium">Theme</span>
        )}
        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value as Theme)}
          className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="light">☀️ Light</option>
          <option value="dark">🌙 Dark</option>
          <option value="system">🖥️ System</option>
        </select>
      </div>
    );
  }

  if (variant === 'buttons') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {showLabel && (
          <span className="text-gray-700 dark:text-gray-200 font-medium text-sm">Theme:</span>
        )}
        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          {(['light', 'dark', 'system'] as Theme[]).map((themeOption) => (
            <button
              key={themeOption}
              onClick={() => setTheme(themeOption)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                theme === themeOption
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              {themeOption === 'light' && '☀️'}
              {themeOption === 'dark' && '🌙'}
              {themeOption === 'system' && '🖥️'}
              <span className="ml-1 capitalize">{themeOption}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Default toggle variant
  return (
    <div className={`flex items-center justify-between ${className}`}>
      {showLabel && (
        <div className="flex items-center gap-2">
          <span className="text-gray-700 dark:text-gray-200 font-medium">
            {theme === 'system' ? `${effectiveTheme === 'dark' ? '🌙' : '☀️'} System` : effectiveTheme === 'dark' ? '🌙 Dark' : '☀️ Light'}
          </span>
          {theme === 'system' && (
            <span className="text-xs text-gray-500 dark:text-gray-400">(Auto)</span>
          )}
        </div>
      )}
      <div className="flex items-center gap-2">
        {/* System preference button */}
        <button
          onClick={() => setTheme('system')}
          className={`p-1.5 rounded-md transition-colors ${
            theme === 'system' 
              ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' 
              : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
          }`}
          title="Use system preference"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </button>
        
        {/* Main toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className={`relative inline-flex ${sizeClasses[size]} items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            effectiveTheme === 'dark' 
              ? 'bg-blue-600' 
              : 'bg-gray-300'
          }`}
          aria-pressed={effectiveTheme === 'dark'}
          title={`Switch to ${effectiveTheme === 'dark' ? 'light' : 'dark'} mode`}
        >
          <span
            className={`inline-block ${knobSizeClasses[size]} transform rounded-full bg-white shadow transition-transform ${translateClasses[size]} flex items-center justify-center`}
          >
            {effectiveTheme === 'dark' ? (
              <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
              </svg>
            )}
          </span>
        </button>
      </div>
    </div>
  );
};
