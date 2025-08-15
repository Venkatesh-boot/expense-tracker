import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Legend, LineChart, Line, ReferenceLine, AreaChart, Area } from 'recharts';
import { AppDispatch, RootState } from '../../store/store';
import { fetchMonthlyDetailsStart } from '../../store/slices/dashboardSlice';
import { formatCurrency } from '../../utils/currencyFormat';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28CFF', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C', '#8DD1E1'];

// Interactive chart component interfaces
interface TooltipPayload {
  name: string;
  value: number;
  payload: any;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

interface MonthlyChartsProps {
  onFilterChange?: (total: number) => void;
}

export default function MonthlyCharts({ onFilterChange }: MonthlyChartsProps) {
  // Get currency from settings API (Redux store)
  const settings = useSelector((state: RootState) => state.settings.settings);
  const currency = settings?.currency || 'INR';
  const dispatch = useDispatch<AppDispatch>();
  const { monthlyDetails, loadingMonthlyDetails, error } = useSelector((state: RootState) => state.dashboard);
  const previousTotal = useRef<number | null>(null);
  
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // API expects 1-based months
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [activeChartView, setActiveChartView] = useState<'pie' | 'bar' | 'line' | 'area'>('bar');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  useEffect(() => {
    dispatch(fetchMonthlyDetailsStart({ year: selectedYear, month: selectedMonth }));
  }, [dispatch, selectedYear, selectedMonth]);

  // Notify parent component when data changes
  useEffect(() => {
    if (monthlyDetails && onFilterChange && monthlyDetails.totalAmount !== previousTotal.current) {
      previousTotal.current = monthlyDetails.totalAmount;
      onFilterChange(monthlyDetails.totalAmount);
    }
  }, [monthlyDetails, onFilterChange]);

  // Handle month/year changes
  const handleMonthChange = (month: number) => {
    setSelectedMonth(month);
    setSelectedCategory(null);
    setSelectedDay(null);
    previousTotal.current = null; // Reset previous total when month changes
  };

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
    setSelectedCategory(null);
    setSelectedDay(null);
    previousTotal.current = null; // Reset previous total when year changes
  };

  // Interactive chart handlers
  const handleCategoryClick = useCallback((data: any) => {
    setSelectedCategory(data.name);
  }, []);

  const handleDayClick = useCallback((data: any) => {
    setSelectedDay(data.day);
  }, []);

  const resetSelection = useCallback(() => {
    setSelectedCategory(null);
    setSelectedDay(null);
  }, []);

  // Custom tooltip components
  const CustomPieTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800 dark:text-gray-200">{data.name}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Amount: <span className="font-bold text-blue-600">{formatCurrency(data.value, currency)}</span>
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Percentage: <span className="font-bold text-green-600">{data.payload?.percentage}%</span>
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            Click to view details
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomBarTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const dayOfWeek = new Date(selectedYear, selectedMonth - 1, Number(label)).toLocaleDateString('en-US', { weekday: 'long' });
      
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800 dark:text-gray-200">Day {label}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{dayOfWeek}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Amount: <span className="font-bold text-blue-600">{formatCurrency(data.value, currency)}</span>
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            Click to analyze this day
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLineTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800 dark:text-gray-200">Day {label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm text-gray-600 dark:text-gray-400">
              {entry.name}: <span className="font-bold" style={{ color: entry.color }}>{formatCurrency(entry.value, currency)}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // CSV Export
  function exportCSV() {
    if (!monthlyDetails?.dailyExpenses) return;
    
    const rows = [
      ['Day', 'Amount'],
      ...monthlyDetails.dailyExpenses.map(d => [d.day, d.amount])
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `monthly-expenses-${selectedYear}-${selectedMonth.toString().padStart(2, '0')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loadingMonthlyDetails) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-lg">Loading monthly details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  if (!monthlyDetails) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-gray-500">No data available for the selected month</div>
      </div>
    );
  }

  // Process data from API
  const { 
    totalAmount, 
    totalExpenses,
    totalIncome,
    totalSavings,
    netIncome,
    savingsRate,
    avgDaily, 
    maxDaily, 
    minDaily, 
    transactionCount,
    incomeTransactionCount,
    savingsTransactionCount,
    categoryBreakdown, 
    dailyExpenses, 
    previousMonthExpenses, 
    previousMonthIncome,
    previousMonthSavings,
    expensePercentChange,
    incomePercentChange,
    savingsPercentChange,
    monthlyBudget,
    budgetUsed,
    budgetRemaining,
    recurringExpenses = []
  } = monthlyDetails;

  // Find highest and lowest spending days
  const highestDay = dailyExpenses.length > 0 
    ? dailyExpenses.reduce((max, d) => d.amount > max.amount ? d : max, dailyExpenses[0])
    : null;
  const lowestDay = dailyExpenses.length > 0 
    ? dailyExpenses.reduce((min, d) => d.amount < min.amount ? d : min, dailyExpenses[0])
    : null;
  const noSpendDays = dailyExpenses.filter(d => d.amount === 0).length;

  // Cumulative spend for line chart
  let cumulative = 0;
  const lineData = dailyExpenses.map(d => {
    cumulative += d.amount;
    return { day: d.day, cumulative };
  });

  // Savings suggestion
  const topCategory = categoryBreakdown.length > 0 ? categoryBreakdown[0] : null;
  const savingsSuggestion = topCategory && topCategory.percentage > 40
    ? `Consider reducing your ${topCategory.name} expenses to save more.`
    : '';

  return (
    <div className="flex flex-col gap-6">
      {/* Month and Year Selection */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-2 sm:mb-4">
        <div className="flex-1">
          <label className="block text-gray-700 dark:text-gray-200 mb-1">Month</label>
          <select
            className="w-full px-2 py-2 sm:px-3 border border-gray-300 rounded-lg text-sm sm:text-base"
            value={selectedMonth}
            onChange={e => handleMonthChange(Number(e.target.value))}
          >
            {months.map((m, idx) => (
              <option key={m} value={idx + 1}>{m}</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-gray-700 dark:text-gray-200 mb-1">Year</label>
          <input
            type="number"
            className="w-full px-2 py-2 sm:px-3 border border-gray-300 rounded-lg text-sm sm:text-base"
            value={selectedYear}
            onChange={e => handleYearChange(Number(e.target.value))}
            min={2000}
            max={2100}
          />
        </div>
      </div>

      {/* Summary Widgets */}
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
          <div className="text-xs text-gray-500">Total Expenses</div>
          <div className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses || totalAmount, currency)}</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
          <div className="text-xs text-gray-500">Total Income</div>
          <div className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome || 0, currency)}</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
          <div className="text-xs text-gray-500">Total Savings</div>
          <div className="text-2xl font-bold text-blue-600">{formatCurrency(totalSavings || 0, currency)}</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
          <div className="text-xs text-gray-500">Net Income</div>
          <div className={`text-2xl font-bold ${(netIncome || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(netIncome || 0, currency)}
          </div>
        </div>
      </div>

      {/* Income vs Expenses vs Savings */}
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
          <div className="text-xs text-gray-500">Avg Daily Spend</div>
          <div className="text-2xl font-bold text-blue-700">{formatCurrency(avgDaily, currency)}</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
          <div className="text-xs text-gray-500">Savings Rate</div>
          <div className="text-2xl font-bold text-blue-600">{savingsRate || 0}%</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
          <div className="text-xs text-gray-500">Transactions</div>
          <div className="text-lg font-bold text-gray-700">
            E: {transactionCount} | I: {incomeTransactionCount || 0} | S: {savingsTransactionCount || 0}
          </div>
        </div>
      </div>

      {/* Top Categories & Month Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow p-4">
          <div className="font-semibold text-blue-700 mb-2">Top Categories</div>
          <ul className="text-sm">
            {categoryBreakdown.slice(0, 3).map(cat => (
              <li key={cat.name} className="flex justify-between py-1">
                <span>{cat.name}</span>
                <span className="font-semibold">{formatCurrency(cat.value, currency)} ({cat.percentage}%)</span>
              </li>
            ))}
            {categoryBreakdown.length === 0 && (
              <li className="text-gray-500">No categories found</li>
            )}
          </ul>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <div className="font-semibold text-blue-700 mb-2">Month-over-Month Changes</div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span>Expenses:</span>
              <div className="flex items-center gap-2">
                <span>{formatCurrency(totalExpenses || totalAmount, currency)}</span>
                <span className={expensePercentChange >= 0 ? 'text-red-600' : 'text-green-600'}>
                  {expensePercentChange >= 0 ? '▲' : '▼'} {Math.abs(expensePercentChange || 0)}%
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span>Income:</span>
              <div className="flex items-center gap-2">
                <span>{formatCurrency(totalIncome || 0, currency)}</span>
                <span className={incomePercentChange >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {incomePercentChange >= 0 ? '▲' : '▼'} {Math.abs(incomePercentChange || 0)}%
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span>Savings:</span>
              <div className="flex items-center gap-2">
                <span>{formatCurrency(totalSavings || 0, currency)}</span>
                <span className={savingsPercentChange >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {savingsPercentChange >= 0 ? '▲' : '▼'} {Math.abs(savingsPercentChange || 0)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Budget Progress & Export */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow p-4">
          <div className="font-semibold text-blue-700 mb-2">Budget Progress</div>
          <div className="w-full bg-gray-100 rounded-full h-4 mb-2">
            <div className="bg-blue-500 h-4 rounded-full transition-all" style={{ width: `${budgetUsed}%` }}></div>
          </div>
          <div className="flex justify-between text-xs">
            <span>{formatCurrency(totalAmount, currency)} / {formatCurrency(monthlyBudget, currency)}</span>
            <span>{budgetUsed}% used</span>
          </div>
          <div className="text-xs text-gray-600 mt-1">
            Remaining: {formatCurrency(budgetRemaining, currency)}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 flex flex-col gap-2">
          <div className="font-semibold text-blue-700 mb-2">Export Data</div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 w-fit" onClick={exportCSV}>
            Download CSV
          </button>
        </div>
      </div>

      {/* Transaction Count, No Spend Days, Max/Min Daily */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow p-4 flex flex-col gap-2">
          <div className="font-semibold text-blue-700 mb-1">Total Transactions</div>
          <div className="text-2xl font-bold text-blue-700">{transactionCount}</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 flex flex-col gap-2">
          <div className="font-semibold text-blue-700 mb-1">No Spend Days</div>
          <div className="text-2xl font-bold text-blue-700">{noSpendDays}</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 flex flex-col gap-2">
          <div className="font-semibold text-blue-700 mb-1">Max Daily</div>
          <div className="text-2xl font-bold text-blue-700">{formatCurrency(maxDaily, currency)}</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 flex flex-col gap-2">
          <div className="font-semibold text-blue-700 mb-1">Min Daily</div>
          <div className="text-2xl font-bold text-blue-700">{formatCurrency(minDaily, currency)}</div>
        </div>
      </div>

      {/* Recurring Expenses & Savings Suggestion */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow p-4">
          <div className="font-semibold text-blue-700 mb-2">Recurring Expenses</div>
          <ul className="text-sm">
            {recurringExpenses.length > 0 ? recurringExpenses.map(r => (
              <li key={r.category} className="flex justify-between py-1">
                <span>{r.category}</span>
                <span className="font-semibold">{formatCurrency(r.amount, currency)}</span>
              </li>
            )) : (
              <li className="text-gray-500">No recurring expenses found</li>
            )}
          </ul>
        </div>
        <div className="bg-white rounded-xl shadow p-4 flex flex-col gap-2">
          <div className="font-semibold text-blue-700 mb-2">Savings Suggestion</div>
          <div className="text-sm text-gray-700">{savingsSuggestion || 'Your spending is well balanced!'}</div>
        </div>
      </div>

      {/* Interactive Chart Controls */}
      {(selectedCategory || selectedDay) && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 mb-4">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-semibold text-gray-800 dark:text-gray-200">
              {selectedCategory && `Category Analysis: ${selectedCategory}`}
              {selectedDay && `Day ${selectedDay} Analysis`}
            </h4>
            <button
              onClick={resetSelection}
              className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              ← Back to Overview
            </button>
          </div>
          
          {selectedCategory && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Category:</span> {selectedCategory}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Total Amount:</span> {formatCurrency(categoryBreakdown.find(c => c.name === selectedCategory)?.value || 0, currency)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Percentage:</span> 
                  {categoryBreakdown.find(c => c.name === selectedCategory)?.percentage || 0}%
                </div>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <div className="font-medium mb-1">Monthly Insights:</div>
                <ul className="space-y-1 text-xs">
                  <li>• Daily average: {formatCurrency(Math.round((categoryBreakdown.find(c => c.name === selectedCategory)?.value || 0) / 30), currency)}</li>
                  <li>• % of monthly budget: {(((categoryBreakdown.find(c => c.name === selectedCategory)?.value || 0) / (monthlyBudget || 1)) * 100).toFixed(1)}%</li>
                  <li>• vs previous month: {expensePercentChange > 0 ? '↑' : '↓'} {Math.abs(expensePercentChange || 0)}%</li>
                </ul>
              </div>
            </div>
          )}

          {selectedDay && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Day:</span> {selectedDay}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Amount:</span> {formatCurrency(dailyExpenses.find(d => d.day === selectedDay)?.amount || 0, currency)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Day of Week:</span> 
                  {new Date(selectedYear, selectedMonth - 1, selectedDay).toLocaleDateString('en-US', { weekday: 'long' })}
                </div>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <div className="font-medium mb-1">Daily Analysis:</div>
                <ul className="space-y-1 text-xs">
                  <li>• vs Daily Average: {((dailyExpenses.find(d => d.day === selectedDay)?.amount || 0) / Math.max(1, avgDaily) * 100 - 100).toFixed(1)}%</li>
                  <li>• vs Highest Day: {((dailyExpenses.find(d => d.day === selectedDay)?.amount || 0) / Math.max(1, maxDaily) * 100).toFixed(1)}%</li>
                  <li>• Cumulative Impact: {formatCurrency(lineData.find(d => d.day === selectedDay)?.cumulative || 0, currency)}</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Enhanced Interactive Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 flex flex-col items-center w-full overflow-hidden">
          <h3 className="font-semibold mb-2 text-blue-700 dark:text-blue-300">Income vs Expenses vs Savings</h3>
          {(totalIncome || totalExpenses || totalSavings) ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Income', value: totalIncome || 0, color: '#10B981' },
                    { name: 'Expenses', value: totalExpenses || totalAmount, color: '#EF4444' },
                    { name: 'Savings', value: totalSavings || 0, color: '#3B82F6' }
                  ].filter(item => item.value > 0)}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={30}
                  label={(entry) => formatCurrency(entry.value ?? 0, currency)}
                >
                  {[
                    { name: 'Income', value: totalIncome || 0, color: '#10B981' },
                    { name: 'Expenses', value: totalExpenses || totalAmount, color: '#EF4444' },
                    { name: 'Savings', value: totalSavings || 0, color: '#3B82F6' }
                  ].filter(item => item.value > 0).map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    formatCurrency(value, currency),
                    name
                  ]}
                  labelFormatter={() => 'Financial Overview'}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-gray-500 dark:text-gray-400 py-8">No financial data to display</div>
          )}
        </div>
        
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 flex flex-col items-center w-full overflow-hidden">
          <h3 className="font-semibold mb-2 text-blue-700 dark:text-blue-300">Expense Breakdown</h3>
          {categoryBreakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={categoryBreakdown}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={(entry) => `${entry.percentage}%`}
                  onClick={handleCategoryClick}
                  style={{ cursor: 'pointer' }}
                >
                  {categoryBreakdown.map((entry, idx) => (
                    <Cell 
                      key={`cell-${idx}`} 
                      fill={COLORS[idx % COLORS.length]}
                      stroke={selectedCategory === entry.name ? '#333' : 'none'}
                      strokeWidth={selectedCategory === entry.name ? 3 : 0}
                    />
                  ))}
                </Pie>
                <Tooltip content={< CustomPieTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-gray-500 dark:text-gray-400 py-8">No expense data to display</div>
          )}
        </div>
      </div>

      {/* Enhanced Daily Expenses Chart */}
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 flex flex-col items-center w-full overflow-hidden">
          <div className="flex justify-between items-center w-full mb-4">
            <h3 className="font-semibold text-blue-700 dark:text-blue-300">Daily Expense Analysis</h3>
            <div className="flex gap-2">
              {(['bar', 'line', 'area'] as const).map((view) => (
                <button
                  key={view}
                  onClick={() => setActiveChartView(view)}
                  className={`px-2 py-1 rounded text-xs ${
                    activeChartView === view 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300'
                  }`}
                >
                  {view.charAt(0).toUpperCase() + view.slice(1)}
                </button>
              ))}
            </div>
          </div>
          {dailyExpenses.length > 0 ? (
            <>
              {activeChartView === 'bar' && (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dailyExpenses}>
                  <XAxis 
                    dataKey="day" 
                    label={{ value: 'Day', position: 'insideBottom', offset: -5 }}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Legend />
                  <Bar 
                    dataKey="amount" 
                    fill="#0088FE"
                    onClick={handleDayClick}
                    style={{ cursor: 'pointer' }}
                    radius={[4, 4, 0, 0]}
                  >
                    {dailyExpenses.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={
                          selectedDay === entry.day ? '#FF8042' :
                          entry.amount > avgDaily ? '#00C49F' : '#0088FE'
                        }
                      />
                    ))}
                  </Bar>
                  <ReferenceLine 
                    y={avgDaily} 
                    stroke="#FFBB28" 
                    strokeDasharray="3 3"
                    label="Avg"
                  />
                </BarChart>
                </ResponsiveContainer>
              )}

              {activeChartView === 'line' && (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dailyExpenses}>
                    <XAxis 
                      dataKey="day"
                      label={{ value: 'Day', position: 'insideBottom', offset: -5 }}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip content={<CustomBarTooltip />} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="#0088FE" 
                      strokeWidth={3}
                      name="Daily Amount"
                      dot={{ r: 5, strokeWidth: 2, fill: '#0088FE' }}
                      activeDot={{ r: 7, strokeWidth: 2, fill: '#FF8042' }}
                    />
                    <ReferenceLine 
                      y={avgDaily} 
                      stroke="#00C49F" 
                      strokeDasharray="3 3"
                      label="Average"
                    />
                    <ReferenceLine 
                      y={maxDaily} 
                      stroke="#FF8042" 
                      strokeDasharray="3 3"
                      label="Max"
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}              {activeChartView === 'area' && (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={dailyExpenses}>
                    <XAxis 
                      dataKey="day"
                      label={{ value: 'Day', position: 'insideBottom', offset: -5 }}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip content={<CustomBarTooltip />} />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="amount"
                      stroke="#0088FE"
                      fill="#0088FE"
                      fillOpacity={0.4}
                      strokeWidth={2}
                      name="Daily Spending"
                    />
                    <ReferenceLine 
                      y={avgDaily} 
                      stroke="#00C49F" 
                      strokeDasharray="3 3"
                      label="Average"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </>
          ) : (
            <div className="text-gray-500 dark:text-gray-400 py-8">No daily expense data to display</div>
          )}
        </div>
      </div>

      {/* Enhanced Cumulative Spend Chart */}
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 flex flex-col items-center w-full overflow-hidden">
        <h3 className="font-semibold mb-2 text-blue-700 dark:text-blue-300">Cumulative Monthly Spend</h3>
        {lineData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={lineData}>
              <XAxis 
                dataKey="day"
                tick={{ fontSize: 12 }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomLineTooltip />} />
              <Legend />
              <Area
                type="monotone"
                dataKey="cumulative"
                stroke="#00C49F"
                fill="#00C49F"
                fillOpacity={0.3}
                strokeWidth={3}
                name="Cumulative Spend"
              />
              <ReferenceLine
                y={monthlyBudget}
                label="Budget"
                stroke="#FF8042"
                strokeDasharray="3 3"
              />
              <ReferenceLine
                y={avgDaily * new Date(selectedYear, selectedMonth, 0).getDate()}
                label="Projected"
                stroke="#FFBB28"
                strokeDasharray="3 3"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-gray-500 dark:text-gray-400 py-8">No data available for cumulative chart</div>
        )}
      </div>
    </div>
  );
}
