import React, { useState, useRef, useEffect } from 'react';

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  placeholder?: string;
  className?: string;
  maxDate?: string;
  minDate?: string;
  presets?: Array<{
    label: string;
    value: DateRange;
  }>;
}

const DEFAULT_PRESETS = [
  {
    label: 'Today',
    value: {
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
    },
  },
  {
    label: 'Yesterday',
    value: (() => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const dateStr = yesterday.toISOString().split('T')[0];
      return { startDate: dateStr, endDate: dateStr };
    })(),
  },
  {
    label: 'Last 7 Days',
    value: (() => {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 6);
      return {
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0],
      };
    })(),
  },
  {
    label: 'Last 30 Days',
    value: (() => {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 29);
      return {
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0],
      };
    })(),
  },
  {
    label: 'This Month',
    value: (() => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return {
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0],
      };
    })(),
  },
  {
    label: 'Last Month',
    value: (() => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      return {
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0],
      };
    })(),
  },
  {
    label: 'This Year',
    value: (() => {
      const now = new Date();
      const start = new Date(now.getFullYear(), 0, 1);
      const end = new Date(now.getFullYear(), 11, 31);
      return {
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0],
      };
    })(),
  },
  {
    label: 'Last Year',
    value: (() => {
      const now = new Date();
      const start = new Date(now.getFullYear() - 1, 0, 1);
      const end = new Date(now.getFullYear() - 1, 11, 31);
      return {
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0],
      };
    })(),
  },
];

export default function DateRangePicker({
  value,
  onChange,
  placeholder = 'Select date range',
  className = '',
  maxDate,
  minDate,
  presets = DEFAULT_PRESETS,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempRange, setTempRange] = useState<DateRange>(value);
  const [activeInput, setActiveInput] = useState<'start' | 'end' | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setActiveInput(null);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Format date for display
  const formatDisplayDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Get display text
  const getDisplayText = () => {
    if (!value.startDate || !value.endDate) return placeholder;
    
    if (value.startDate === value.endDate) {
      return formatDisplayDate(value.startDate);
    }
    
    return `${formatDisplayDate(value.startDate)} - ${formatDisplayDate(value.endDate)}`;
  };

  // Handle preset selection
  const handlePresetSelect = (preset: DateRange) => {
    setTempRange(preset);
    onChange(preset);
    setIsOpen(false);
    setActiveInput(null);
  };

  // Handle date input change
  const handleDateChange = (field: 'startDate' | 'endDate', dateValue: string) => {
    const newRange = { ...tempRange, [field]: dateValue };
    
    // Ensure start date is not after end date
    if (field === 'startDate' && newRange.endDate && dateValue > newRange.endDate) {
      newRange.endDate = dateValue;
    }
    if (field === 'endDate' && newRange.startDate && dateValue < newRange.startDate) {
      newRange.startDate = dateValue;
    }
    
    setTempRange(newRange);
  };

  // Apply the date range
  const applyDateRange = () => {
    if (tempRange.startDate && tempRange.endDate) {
      onChange(tempRange);
      setIsOpen(false);
      setActiveInput(null);
    }
  };

  // Cancel and reset
  const cancelSelection = () => {
    setTempRange(value);
    setIsOpen(false);
    setActiveInput(null);
  };

  // Clear selection
  const clearSelection = () => {
    const emptyRange = { startDate: '', endDate: '' };
    setTempRange(emptyRange);
    onChange(emptyRange);
    setIsOpen(false);
    setActiveInput(null);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Input Display */}
      <div
        ref={inputRef}
        className={`
          flex items-center justify-between px-3 py-2 border rounded-lg cursor-pointer
          transition-colors duration-200 min-w-[200px]
          ${isOpen
            ? 'border-blue-500 ring-2 ring-blue-200 dark:border-blue-400 dark:ring-blue-800'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }
          bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
        `}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          <svg
            className="w-4 h-4 text-gray-500 dark:text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className={`${!value.startDate ? 'text-gray-500 dark:text-gray-400' : ''}`}>
            {getDisplayText()}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {value.startDate && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearSelection();
              }}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className={`
            absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
            rounded-lg shadow-lg z-50 min-w-[320px] overflow-hidden
          `}
        >
          <div className="flex">
            {/* Presets */}
            <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Quick Select</h4>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {presets.map((preset, index) => (
                  <button
                    key={index}
                    onClick={() => handlePresetSelect(preset.value)}
                    className={`
                      w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700
                      transition-colors duration-150
                      ${
                        value.startDate === preset.value.startDate &&
                        value.endDate === preset.value.endDate
                          ? 'bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                          : 'text-gray-700 dark:text-gray-300'
                      }
                    `}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Date Selection */}
            <div className="flex-1 p-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={tempRange.startDate}
                    onChange={(e) => handleDateChange('startDate', e.target.value)}
                    onFocus={() => setActiveInput('start')}
                    min={minDate}
                    max={maxDate}
                    className={`
                      w-full px-3 py-2 border rounded-md text-sm
                      ${activeInput === 'start'
                        ? 'border-blue-500 ring-1 ring-blue-200 dark:border-blue-400 dark:ring-blue-800'
                        : 'border-gray-300 dark:border-gray-600'
                      }
                      bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                      focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200
                      dark:focus:border-blue-400 dark:focus:ring-blue-800
                    `}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={tempRange.endDate}
                    onChange={(e) => handleDateChange('endDate', e.target.value)}
                    onFocus={() => setActiveInput('end')}
                    min={tempRange.startDate || minDate}
                    max={maxDate}
                    className={`
                      w-full px-3 py-2 border rounded-md text-sm
                      ${activeInput === 'end'
                        ? 'border-blue-500 ring-1 ring-blue-200 dark:border-blue-400 dark:ring-blue-800'
                        : 'border-gray-300 dark:border-gray-600'
                      }
                      bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                      focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200
                      dark:focus:border-blue-400 dark:focus:ring-blue-800
                    `}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={cancelSelection}
                    className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md
                             text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700
                             transition-colors duration-150"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={applyDateRange}
                    disabled={!tempRange.startDate || !tempRange.endDate}
                    className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md
                             hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600
                             disabled:cursor-not-allowed transition-colors duration-150"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
