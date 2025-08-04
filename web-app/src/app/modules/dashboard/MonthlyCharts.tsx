import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Legend, LineChart, Line, ReferenceLine } from 'recharts';
import { AppDispatch, RootState } from '../../store/store';
import { fetchMonthlyDetailsStart } from '../../store/slices/dashboardSlice';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28CFF'];

export default function MonthlyCharts() {
  const dispatch = useDispatch<AppDispatch>();
  const { monthlyDetails, loadingMonthlyDetails, error } = useSelector((state: RootState) => state.dashboard);
  
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // API expects 1-based months
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    dispatch(fetchMonthlyDetailsStart({ year: selectedYear, month: selectedMonth }));
  }, [dispatch, selectedYear, selectedMonth]);

  // Handle month/year changes
  const handleMonthChange = (month: number) => {
    setSelectedMonth(month);
  };

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
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
    avgDaily, 
    maxDaily, 
    minDaily, 
    transactionCount,
    categoryBreakdown, 
    dailyExpenses, 
    previousMonthTotal, 
    percentChange,
    monthlyBudget,
    budgetUsed,
    budgetRemaining
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

  // Recurring expenses (simulated - this could be enhanced with actual data)
  const recurring = [
    { name: 'Netflix', amount: 499 },
    { name: 'Gym', amount: 1200 },
  ];

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
          <div className="text-xs text-gray-500">Total Spent</div>
          <div className="text-2xl font-bold text-blue-700">₹{totalAmount}</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
          <div className="text-xs text-gray-500">Avg Daily Spend</div>
          <div className="text-2xl font-bold text-blue-700">₹{avgDaily}</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
          <div className="text-xs text-gray-500">Highest Day</div>
          <div className="text-lg font-bold text-green-600">Day {highestDay?.day || 'N/A'}</div>
          <div className="text-sm">₹{highestDay?.amount || 0}</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
          <div className="text-xs text-gray-500">Lowest Day</div>
          <div className="text-lg font-bold text-red-600">Day {lowestDay?.day || 'N/A'}</div>
          <div className="text-sm">₹{lowestDay?.amount || 0}</div>
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
                <span className="font-semibold">₹{cat.value} ({cat.percentage}%)</span>
              </li>
            ))}
            {categoryBreakdown.length === 0 && (
              <li className="text-gray-500">No categories found</li>
            )}
          </ul>
        </div>
        <div className="bg-white rounded-xl shadow p-4 flex flex-col gap-2">
          <div className="font-semibold text-blue-700 mb-1">This Month vs Last Month</div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold">₹{totalAmount}</span>
            <span className={percentChange >= 0 ? 'text-red-600' : 'text-green-600'}>
              {percentChange >= 0 ? '▲' : '▼'} {Math.abs(percentChange)}%
            </span>
            <span className="text-xs text-gray-500">(Last: ₹{previousMonthTotal})</span>
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
            <span>₹{totalAmount} / ₹{monthlyBudget}</span>
            <span>{budgetUsed}% used</span>
          </div>
          <div className="text-xs text-gray-600 mt-1">
            Remaining: ₹{budgetRemaining}
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
          <div className="text-2xl font-bold text-blue-700">₹{maxDaily}</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 flex flex-col gap-2">
          <div className="font-semibold text-blue-700 mb-1">Min Daily</div>
          <div className="text-2xl font-bold text-blue-700">₹{minDaily}</div>
        </div>
      </div>

      {/* Recurring Expenses & Savings Suggestion */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow p-4">
          <div className="font-semibold text-blue-700 mb-2">Recurring Expenses</div>
          <ul className="text-sm">
            {recurring.map(r => (
              <li key={r.name} className="flex justify-between py-1">
                <span>{r.name}</span>
                <span className="font-semibold">₹{r.amount}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white rounded-xl shadow p-4 flex flex-col gap-2">
          <div className="font-semibold text-blue-700 mb-2">Savings Suggestion</div>
          <div className="text-sm text-gray-700">{savingsSuggestion || 'Your spending is well balanced!'}</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
          <h3 className="font-semibold mb-2 text-blue-700">Expense Breakdown (Pie)</h3>
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
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-gray-500 py-8">No expense data to display</div>
          )}
        </div>
        <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
          <h3 className="font-semibold mb-2 text-blue-700">Expense by Day (Bar)</h3>
          {dailyExpenses.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={dailyExpenses}>
                <XAxis dataKey="day" label={{ value: 'Day', position: 'insideBottom', offset: -5 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="amount" fill="#0088FE" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-gray-500 py-8">No daily expense data to display</div>
          )}
        </div>
      </div>

      {/* Cumulative Spend Line Chart */}
      <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
        <h3 className="font-semibold mb-2 text-blue-700">Cumulative Spend (Line)</h3>
        {lineData.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={lineData}>
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="cumulative" stroke="#00C49F" strokeWidth={2} dot={false} />
              <ReferenceLine y={monthlyBudget} label="Budget" stroke="#FF8042" strokeDasharray="3 3" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-gray-500 py-8">No data available for cumulative chart</div>
        )}
      </div>
    </div>
  );
}
