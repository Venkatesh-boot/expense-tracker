import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Legend, LineChart, Line, ReferenceLine } from 'recharts';
import { AppDispatch, RootState } from '../../store/store';
import { fetchDailyDetailsStart } from '../../store/slices/dashboardSlice';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28CFF'];

export default function DailyCharts() {
  const dispatch = useDispatch<AppDispatch>();
  const { dailyDetails, loadingDailyDetails, error } = useSelector((state: RootState) => state.dashboard);
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); // YYYY-MM-DD format

  useEffect(() => {
    dispatch(fetchDailyDetailsStart({ date: selectedDate }));
  }, [dispatch, selectedDate]);

  // Handle date change
  const handleDateChange = (date: string) => {
    setSelectedDate(date);
  };

  // CSV Export
  function exportCSV() {
    if (!dailyDetails?.hourlyExpenses) return;
    
    const rows = [
      ['Hour', 'Amount'],
      ...dailyDetails.hourlyExpenses.map(h => [h.hour, h.amount])
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `daily-expenses-${selectedDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loadingDailyDetails) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-lg">Loading daily details...</div>
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

  if (!dailyDetails) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-gray-500">No data available for the selected date</div>
      </div>
    );
  }

  // Process data from API
  const { 
    totalAmount, 
    avgHourly, 
    maxHourly, 
    minHourly, 
    transactionCount,
    categoryBreakdown, 
    hourlyExpenses, 
    previousDayTotal, 
    percentChange,
    dailyBudget,
    budgetUsed,
    budgetRemaining,
    topExpenseCategory,
    expensesByTimeOfDay,
    dayName
  } = dailyDetails;

  // Find peak spending hour
  const peakHour = hourlyExpenses.length > 0 
    ? hourlyExpenses.reduce((max, h) => h.amount > max.amount ? h : max, hourlyExpenses[0])
    : null;
  
  // Find quietest hour
  const quietestHour = hourlyExpenses.length > 0 
    ? hourlyExpenses.reduce((min, h) => h.amount < min.amount ? h : min, hourlyExpenses[0])
    : null;

  // Time of day data for chart
  const timeOfDayData = [
    { name: 'Morning (6-12)', value: expensesByTimeOfDay.morning },
    { name: 'Afternoon (12-18)', value: expensesByTimeOfDay.afternoon },
    { name: 'Evening (18-22)', value: expensesByTimeOfDay.evening },
    { name: 'Night (22-6)', value: expensesByTimeOfDay.night },
  ];

  // Cumulative spend for line chart
  let cumulative = 0;
  const lineData = hourlyExpenses.map(h => {
    cumulative += h.amount;
    return { hour: h.hour, cumulative };
  });

  // Format hour for display
  const formatHour = (hour: number) => {
    if (hour === 0) return '12 AM';
    if (hour < 12) return `${hour} AM`;
    if (hour === 12) return '12 PM';
    return `${hour - 12} PM`;
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Date Selection */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-2 sm:mb-4">
        <div className="flex-1">
          <label className="block text-gray-700 dark:text-gray-200 mb-1">Date</label>
          <input
            type="date"
            className="w-full px-2 py-2 sm:px-3 border border-gray-300 rounded-lg text-sm sm:text-base"
            value={selectedDate}
            onChange={e => handleDateChange(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
          />
        </div>
        <div className="flex-1 flex items-end">
          <div className="text-sm text-gray-600 dark:text-gray-300">
            {dayName && <span className="font-semibold">{dayName}</span>}
          </div>
        </div>
      </div>

      {/* Summary Widgets */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
          <div className="text-xs text-gray-500">Total Spent</div>
          <div className="text-2xl font-bold text-blue-700">₹{totalAmount}</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
          <div className="text-xs text-gray-500">Avg Hourly</div>
          <div className="text-2xl font-bold text-blue-700">₹{avgHourly}</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
          <div className="text-xs text-gray-500">Peak Hour</div>
          <div className="text-lg font-bold text-green-600">{peakHour ? formatHour(peakHour.hour) : 'N/A'}</div>
          <div className="text-sm">₹{peakHour?.amount || 0}</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
          <div className="text-xs text-gray-500">Quietest Hour</div>
          <div className="text-lg font-bold text-red-600">{quietestHour ? formatHour(quietestHour.hour) : 'N/A'}</div>
          <div className="text-sm">₹{quietestHour?.amount || 0}</div>
        </div>
      </div>

      {/* Top Category & Day Comparison */}
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
          {topExpenseCategory && (
            <div className="mt-2 text-xs text-gray-600">
              Top category: <span className="font-semibold">{topExpenseCategory}</span>
            </div>
          )}
        </div>
        <div className="bg-white rounded-xl shadow p-4 flex flex-col gap-2">
          <div className="font-semibold text-blue-700 mb-1">Today vs Yesterday</div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold">₹{totalAmount}</span>
            <span className={percentChange >= 0 ? 'text-red-600' : 'text-green-600'}>
              {percentChange >= 0 ? '▲' : '▼'} {Math.abs(percentChange)}%
            </span>
            <span className="text-xs text-gray-500">(Yesterday: ₹{previousDayTotal})</span>
          </div>
        </div>
      </div>

      {/* Budget Progress & Export */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow p-4">
          <div className="font-semibold text-blue-700 mb-2">Daily Budget Progress</div>
          <div className="w-full bg-gray-100 rounded-full h-4 mb-2">
            <div className="bg-blue-500 h-4 rounded-full transition-all" style={{ width: `${Math.min(budgetUsed, 100)}%` }}></div>
          </div>
          <div className="flex justify-between text-xs">
            <span>₹{totalAmount} / ₹{dailyBudget}</span>
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

      {/* Transaction Count, Time Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow p-4 flex flex-col gap-2">
          <div className="font-semibold text-blue-700 mb-1">Total Transactions</div>
          <div className="text-2xl font-bold text-blue-700">{transactionCount}</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 flex flex-col gap-2">
          <div className="font-semibold text-blue-700 mb-1">Max Hourly</div>
          <div className="text-2xl font-bold text-blue-700">₹{maxHourly}</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 flex flex-col gap-2">
          <div className="font-semibold text-blue-700 mb-1">Min Hourly</div>
          <div className="text-2xl font-bold text-blue-700">₹{minHourly}</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 flex flex-col gap-2">
          <div className="font-semibold text-blue-700 mb-1">Most Active Time</div>
          <div className="text-lg font-bold text-blue-700">
            {timeOfDayData.reduce((max, curr) => curr.value > max.value ? curr : max, timeOfDayData[0]).name.split(' ')[0]}
          </div>
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
          <h3 className="font-semibold mb-2 text-blue-700">Time of Day Breakdown</h3>
          {timeOfDayData.some(d => d.value > 0) ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={timeOfDayData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  label
                >
                  {timeOfDayData.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-gray-500 py-8">No time-based data to display</div>
          )}
        </div>
      </div>

      {/* Hourly Expenses Bar Chart */}
      <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
        <h3 className="font-semibold mb-2 text-blue-700">Hourly Expenses (Bar)</h3>
        {hourlyExpenses.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={hourlyExpenses}>
              <XAxis 
                dataKey="hour" 
                label={{ value: 'Hour', position: 'insideBottom', offset: -5 }}
                tickFormatter={formatHour}
              />
              <YAxis />
              <Tooltip labelFormatter={(hour) => `Hour: ${formatHour(Number(hour))}`} />
              <Legend />
              <Bar dataKey="amount" fill="#0088FE" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-gray-500 py-8">No hourly expense data to display</div>
        )}
      </div>

      {/* Cumulative Spend Line Chart */}
      <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
        <h3 className="font-semibold mb-2 text-blue-700">Cumulative Spend Throughout Day</h3>
        {lineData.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={lineData}>
              <XAxis 
                dataKey="hour" 
                tickFormatter={formatHour}
              />
              <YAxis />
              <Tooltip labelFormatter={(hour) => `Hour: ${formatHour(Number(hour))}`} />
              <Legend />
              <Line type="monotone" dataKey="cumulative" stroke="#00C49F" strokeWidth={2} dot={false} />
              <ReferenceLine y={dailyBudget} label="Daily Budget" stroke="#FF8042" strokeDasharray="3 3" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-gray-500 py-8">No data available for cumulative chart</div>
        )}
      </div>
    </div>
  );
}
