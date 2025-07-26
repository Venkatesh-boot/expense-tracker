import React, { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Legend, LineChart, Line, ReferenceLine } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28CFF'];

const pieData = [
  { name: 'Food', value: 500 },
  { name: 'Transport', value: 200 },
  { name: 'Shopping', value: 1200 },
  { name: 'Bills', value: 800 },
  { name: 'Entertainment', value: 300 },
];

// Simulate last month's data for comparison
const lastMonthTotal = 3200;
const thisMonthTotal = pieData.reduce((sum, d) => sum + d.value, 0);
const percentChange = lastMonthTotal ? Math.round(((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100) : 0;

// Bar data for 30 days
const barData = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  amount: Math.floor(Math.random() * 500) + 100 // Random amount between 100-600
}));

// Cumulative spend for line chart
let cumulative = 0;
const lineData = barData.map(d => {
  cumulative += d.amount;
  return { day: d.day, cumulative };
});

// Removed duplicate COLORS

// Summary calculations
const totalSpent = barData.reduce((sum, d) => sum + d.amount, 0);
const avgSpent = Math.round(totalSpent / barData.length);
const highestDay = barData.reduce((max, d) => d.amount > max.amount ? d : max, barData[0]);
const lowestDay = barData.reduce((min, d) => d.amount < min.amount ? d : min, barData[0]);
// Removed unused numTransactions
const noSpendDays = barData.filter(d => d.amount === 0).length;
const biggestExpense = Math.max(...barData.map(d => d.amount));

// Top 3 categories
const topCategories = [...pieData].sort((a, b) => b.value - a.value).slice(0, 3);

// Budget (example)
const budget = 12000;
const budgetUsed = Math.min(100, Math.round((totalSpent / budget) * 100));

// Recurring expenses (simulated)
const recurring = [
  { name: 'Netflix', amount: 499 },
  { name: 'Gym', amount: 1200 },
];

// Savings suggestion
const highestCategory = topCategories[0];
const savingsSuggestion = highestCategory.value > 0.4 * totalSpent
  ? `Consider reducing your ${highestCategory.name} expenses to save more.`
  : '';

// CSV Export
function exportCSV() {
  const rows = [
    ['Day', 'Amount'],
    ...barData.map(d => [d.day, d.amount])
  ];
  const csv = rows.map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'monthly-expenses.csv';
  a.click();
  URL.revokeObjectURL(url);
}

// Example daywise data for a 30-day month
// Removed duplicate barData and COLORS

export default function MonthlyCharts() {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // TODO: Use selectedMonth and selectedYear to filter data as needed

  return (
    <div className="flex flex-col gap-6">
      {/* Month and Year Selection */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-2 sm:mb-4">
        <div className="flex-1">
          <label className="block text-gray-700 mb-1">Month</label>
          <select
            className="w-full px-2 py-2 sm:px-3 border border-gray-300 rounded-lg text-sm sm:text-base"
            value={selectedMonth}
            onChange={e => setSelectedMonth(Number(e.target.value))}
          >
            {months.map((m, idx) => (
              <option key={m} value={idx}>{m}</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-gray-700 mb-1">Year</label>
          <input
            type="number"
            className="w-full px-2 py-2 sm:px-3 border border-gray-300 rounded-lg text-sm sm:text-base"
            value={selectedYear}
            onChange={e => setSelectedYear(Number(e.target.value))}
            min={2000}
            max={2100}
          />
        </div>
      </div>
      {/* Summary Widgets */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
          <div className="text-xs text-gray-500">Total Spent</div>
          <div className="text-2xl font-bold text-blue-700">₹{totalSpent}</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
          <div className="text-xs text-gray-500">Avg Daily Spend</div>
          <div className="text-2xl font-bold text-blue-700">₹{avgSpent}</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
          <div className="text-xs text-gray-500">Highest Day</div>
          <div className="text-lg font-bold text-green-600">Day {highestDay.day}</div>
          <div className="text-sm">₹{highestDay.amount}</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
          <div className="text-xs text-gray-500">Lowest Day</div>
          <div className="text-lg font-bold text-red-600">Day {lowestDay.day}</div>
          <div className="text-sm">₹{lowestDay.amount}</div>
        </div>
      </div>

      {/* Top Categories & Month Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow p-4">
          <div className="font-semibold text-blue-700 mb-2">Top Categories</div>
          <ul className="text-sm">
            {topCategories.map(cat => (
              <li key={cat.name} className="flex justify-between py-1">
                <span>{cat.name}</span>
                <span className="font-semibold">₹{cat.value} ({Math.round((cat.value/thisMonthTotal)*100)}%)</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white rounded-xl shadow p-4 flex flex-col gap-2">
          <div className="font-semibold text-blue-700 mb-1">This Month vs Last Month</div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold">₹{thisMonthTotal}</span>
            <span className={percentChange >= 0 ? 'text-green-600' : 'text-red-600'}>
              {percentChange >= 0 ? '▲' : '▼'} {Math.abs(percentChange)}%
            </span>
            <span className="text-xs text-gray-500">(Last: ₹{lastMonthTotal})</span>
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
            <span>₹{totalSpent} / ₹{budget}</span>
            <span>{budgetUsed}% used</span>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 flex flex-col gap-2">
          <div className="font-semibold text-blue-700 mb-2">Export Data</div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 w-fit" onClick={exportCSV}>Download CSV</button>
        </div>
      </div>

      {/* Biggest Expense, No Spend Days, Recurring, Suggestion */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow p-4 flex flex-col gap-2">
          <div className="font-semibold text-blue-700 mb-1">Biggest Single Expense</div>
          <div className="text-2xl font-bold text-blue-700">₹{biggestExpense}</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 flex flex-col gap-2">
          <div className="font-semibold text-blue-700 mb-1">No Spend Days</div>
          <div className="text-2xl font-bold text-blue-700">{noSpendDays}</div>
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
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={70}
                label
              >
                {pieData.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
          <h3 className="font-semibold mb-2 text-blue-700">Expense by Day (Bar)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData}>
              <XAxis dataKey="day" label={{ value: 'Day', position: 'insideBottom', offset: -5 }} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="amount" fill="#0088FE" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cumulative Spend Line Chart */}
      <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
        <h3 className="font-semibold mb-2 text-blue-700">Cumulative Spend (Line)</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={lineData}>
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="cumulative" stroke="#00C49F" strokeWidth={2} dot={false} />
            <ReferenceLine y={budget} label="Budget" stroke="#FF8042" strokeDasharray="3 3" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
