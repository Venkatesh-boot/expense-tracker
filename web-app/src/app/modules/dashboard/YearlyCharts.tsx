import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell, LineChart, Line, ReferenceLine } from 'recharts';
import { AppDispatch, RootState } from '../../store/store';
import { fetchYearlyDetailsStart } from '../../store/slices/dashboardSlice';
import { formatCurrency } from '../../utils/currencyFormat';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28CFF'];

interface YearlyChartsProps {
  onFilterChange?: (total: number) => void;
}

export default function YearlyCharts({ onFilterChange }: YearlyChartsProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { yearlyDetails, loadingYearlyDetails, error } = useSelector((state: RootState) => state.dashboard);
  const previousTotal = useRef<number | null>(null);
  
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    dispatch(fetchYearlyDetailsStart({ year: selectedYear }));
  }, [dispatch, selectedYear]);

  // Notify parent component when data changes
  useEffect(() => {
    if (yearlyDetails && onFilterChange && yearlyDetails.totalAmount !== previousTotal.current) {
      previousTotal.current = yearlyDetails.totalAmount;
      onFilterChange(yearlyDetails.totalAmount);
    }
  }, [yearlyDetails, onFilterChange]);

  // Handle year change
  const handleYearChange = (year: number) => {
    setSelectedYear(year);
    previousTotal.current = null; // Reset previous total when year changes
  };

  // Get currency from settings API (Redux store)
  const settings = useSelector((state: RootState) => state.settings.settings);
  const currency = settings?.currency || 'INR';
  // CSV Export
  function exportCSV() {
    if (!yearlyDetails?.monthlyExpenses) return;
    
    const rows = [
      ['Month', 'Amount'],
      ...yearlyDetails.monthlyExpenses.map(d => [d.month, d.amount])
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `yearly-expenses-${selectedYear}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loadingYearlyDetails) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-lg">Loading yearly details...</div>
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

  if (!yearlyDetails) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-gray-500">No data available for the selected year</div>
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
    avgMonthly, 
    maxMonthly, 
    minMonthly, 
    transactionCount,
    incomeTransactionCount,
    savingsTransactionCount,
    categoryBreakdown, 
    monthlyExpenses, 
    previousYearExpenses, 
    previousYearIncome,
    previousYearSavings,
    expensePercentChange,
    incomePercentChange,
    savingsPercentChange,
    highestMonth,
    lowestMonth,
    yearlyBudget,
    budgetUsed,
    budgetRemaining,
    recurringExpenses = []
  } = yearlyDetails;

  // Savings suggestion
  const topCategory = categoryBreakdown.length > 0 ? categoryBreakdown[0] : null;
  const savingsSuggestion = topCategory && topCategory.percentage > 40
    ? `Consider reducing your ${topCategory.name} expenses to save more.`
    : '';

  // Generate year options (current year and past 5 years)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 6 }, (_, i) => currentYear - i);

  // Heatmap color function
  function getHeatColor(amount: number) {
    if (amount < avgMonthly * 0.5) return 'bg-blue-100';
    if (amount < avgMonthly * 0.8) return 'bg-blue-300';
    if (amount < avgMonthly) return 'bg-green-200';
    if (amount < avgMonthly * 1.2) return 'bg-yellow-200';
    if (amount < avgMonthly * 1.5) return 'bg-orange-200';
    return 'bg-red-400';
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Year Selection */}
      <div className="flex justify-end mb-2">
        <label className="mr-2 font-medium text-green-700 dark:text-green-200">Year:</label>
        <select
          className="border rounded px-2 py-1 text-green-700 focus:outline-none focus:ring-2 focus:ring-green-400"
          value={selectedYear}
          onChange={e => handleYearChange(Number(e.target.value))}
        >
          {yearOptions.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      {/* Summary Widgets */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center w-full overflow-hidden">
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
          <div className={`text-2xl font-bold ${(netIncome || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(netIncome || 0, currency)}</div>
        </div>
      </div>

      {/* Income vs Expenses vs Savings Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
          <div className="text-xs text-gray-500">Avg Monthly Spend</div>
          <div className="text-2xl font-bold text-green-700">{formatCurrency(avgMonthly, currency)}</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
          <div className="text-xs text-gray-500">Savings Rate</div>
          <div className="text-2xl font-bold text-blue-600">{savingsRate || 0}%</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
          <div className="text-xs text-gray-500">Highest Month</div>
          <div className="text-lg font-bold text-green-600">{highestMonth?.month || 'N/A'}</div>
          <div className="text-sm">{formatCurrency(highestMonth?.amount || 0, currency)}</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
          <div className="text-xs text-gray-500">Lowest Month</div>
          <div className="text-lg font-bold text-red-600">{lowestMonth?.month || 'N/A'}</div>
          <div className="text-sm">{formatCurrency(lowestMonth?.amount || 0, currency)}</div>
        </div>
      </div>

      {/* Top Categories & Year Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow p-4">
          <div className="font-semibold text-green-700 mb-2">Top Categories</div>
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
          <div className="font-semibold text-green-700 mb-2">Year-over-Year Changes</div>
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
          <div className="font-semibold text-green-700 mb-2">Yearly Budget Progress</div>
          <div className="w-full bg-gray-100 rounded-full h-4 mb-2">
            <div className="bg-green-500 h-4 rounded-full transition-all" style={{ width: `${budgetUsed}%` }}></div>
          </div>
          <div className="flex justify-between text-xs">
            <span>{formatCurrency(totalAmount, currency)} / {formatCurrency(yearlyBudget, currency)}</span>
            <span>{budgetUsed}% used</span>
          </div>
          <div className="text-xs text-gray-600 mt-1">
            Remaining: {formatCurrency(budgetRemaining, currency)}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 flex flex-col gap-2">
          <div className="font-semibold text-green-700 mb-2">Export Data</div>
          <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 w-fit" onClick={exportCSV}>
            Download CSV
          </button>
        </div>
      </div>

      {/* Transaction Count, Max/Min Monthly */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow p-4 flex flex-col gap-2">
          <div className="font-semibold text-green-700 mb-1">Transactions</div>
          <div className="text-sm text-gray-700">
            E: {transactionCount} | I: {incomeTransactionCount || 0} | S: {savingsTransactionCount || 0}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 flex flex-col gap-2">
          <div className="font-semibold text-green-700 mb-1">No Spend Months</div>
          <div className="text-2xl font-bold text-green-700">{monthlyExpenses.filter(m => m.amount === 0).length}</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 flex flex-col gap-2">
          <div className="font-semibold text-green-700 mb-1">Max Monthly</div>
          <div className="text-2xl font-bold text-green-700">{formatCurrency(maxMonthly, currency)}</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 flex flex-col gap-2">
          <div className="font-semibold text-green-700 mb-1">Min Monthly</div>
          <div className="text-2xl font-bold text-green-700">{formatCurrency(minMonthly, currency)}</div>
        </div>
      </div>

      {/* Recurring Expenses & Savings Suggestion */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow p-4">
          <div className="font-semibold text-green-700 mb-2">Recurring Expenses</div>
          <ul className="text-sm">
            {recurringExpenses.length > 0 ? recurringExpenses.map(r => (
              <li key={r.category} className="flex justify-between py-1">
                <span>{r.category}</span>
                <span className="font-semibold">{formatCurrency(r.amount * 12, currency)}</span>
              </li>
            )) : (
              <li className="text-gray-500">No recurring expenses found</li>
            )}
          </ul>
        </div>
        <div className="bg-white rounded-xl shadow p-4 flex flex-col gap-2">
          <div className="font-semibold text-green-700 mb-2">Savings Suggestion</div>
          <div className="text-sm text-gray-700">{savingsSuggestion || 'Your spending is well balanced!'}</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
          <h3 className="font-semibold mb-2 text-green-700">Income vs Expenses vs Savings</h3>
          {(totalIncome || totalExpenses || totalSavings) ? (
            <ResponsiveContainer width="100%" height={200}>
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
                  outerRadius={70}
                  label
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
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-gray-500 py-8">No financial data to display</div>
          )}
        </div>
        <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
          <h3 className="font-semibold mb-2 text-green-700">Spend by Category (Pie)</h3>
          {categoryBreakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={categoryBreakdown}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  label
                >
                  {categoryBreakdown.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    formatCurrency(value, currency),
                    name
                  ]}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-gray-500 py-8">No expense data to display</div>
          )}
        </div>
      </div>

      {/* Monthly Expenses Bar Chart */}
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
          <h3 className="font-semibold mb-2 text-green-700">Monthwise Expenses (Bar)</h3>
          {monthlyExpenses.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyExpenses}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    formatCurrency(value, currency),
                    name
                  ]}
                />
                <Legend />
                <Bar dataKey="amount" fill="#34D399" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-gray-500 py-8">No monthly expense data to display</div>
          )}
        </div>
      </div>

      {/* Month-over-Month Trend (Line Chart) */}
      <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
        <h3 className="font-semibold mb-2 text-green-700">Month-over-Month Trend (Line)</h3>
        {monthlyExpenses.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={monthlyExpenses}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value: number, name: string) => [
                  formatCurrency(value, currency),
                  name
                ]}
              />
              <Legend />
              <Line type="monotone" dataKey="amount" stroke="#00C49F" strokeWidth={2} dot={true} />
              <ReferenceLine y={avgMonthly} label="Avg" stroke="#FF8042" strokeDasharray="3 3" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-gray-500 py-8">No data available for trend chart</div>
        )}
      </div>

      {/* Expense Heatmap */}
      <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
        <h3 className="font-semibold mb-2 text-green-700">Expense Heatmap</h3>
        {monthlyExpenses.length > 0 ? (
          <div className="grid grid-cols-6 gap-2 w-full">
            {monthlyExpenses.map((d, idx) => (
              <div key={d.month} className={`rounded-lg h-10 flex flex-col items-center justify-center text-xs font-semibold text-gray-700 ${getHeatColor(d.amount)}`} title={formatCurrency(d.amount, currency)}>
                <span>{d.month}</span>
                <span>{formatCurrency(d.amount, currency)}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-500 py-8">No data available for heatmap</div>
        )}
      </div>
    </div>
  );
}
