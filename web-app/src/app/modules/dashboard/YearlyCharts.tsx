import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell, LineChart, Line, ReferenceLine } from 'recharts';


const yearlyData: Record<string, { barData: any[]; pieData: any[]; lastYearTotal: number }> = {
  '2024': {
    barData: [
      { month: 'Jan', amount: 1200, Food: 400, Transport: 100, Shopping: 300, Bills: 250, Entertainment: 150 },
      { month: 'Feb', amount: 900, Food: 300, Transport: 80, Shopping: 200, Bills: 220, Entertainment: 100 },
      { month: 'Mar', amount: 1500, Food: 500, Transport: 120, Shopping: 400, Bills: 300, Entertainment: 180 },
      { month: 'Apr', amount: 1100, Food: 350, Transport: 90, Shopping: 250, Bills: 250, Entertainment: 160 },
      { month: 'May', amount: 1700, Food: 600, Transport: 150, Shopping: 500, Bills: 300, Entertainment: 150 },
      { month: 'Jun', amount: 1300, Food: 400, Transport: 110, Shopping: 350, Bills: 300, Entertainment: 140 },
      { month: 'Jul', amount: 1400, Food: 450, Transport: 120, Shopping: 400, Bills: 300, Entertainment: 130 },
      { month: 'Aug', amount: 1600, Food: 500, Transport: 130, Shopping: 500, Bills: 320, Entertainment: 150 },
      { month: 'Sep', amount: 1250, Food: 380, Transport: 100, Shopping: 300, Bills: 300, Entertainment: 170 },
      { month: 'Oct', amount: 1800, Food: 650, Transport: 160, Shopping: 600, Bills: 300, Entertainment: 90 },
      { month: 'Nov', amount: 1350, Food: 400, Transport: 120, Shopping: 400, Bills: 300, Entertainment: 130 },
      { month: 'Dec', amount: 1550, Food: 500, Transport: 120, Shopping: 500, Bills: 300, Entertainment: 130 },
    ],
    pieData: [
      { name: 'Food', value: 8000 },
      { name: 'Transport', value: 3500 },
      { name: 'Shopping', value: 12000 },
      { name: 'Bills', value: 9000 },
      { name: 'Entertainment', value: 4000 },
    ],
    lastYearTotal: 17000,
  },
  '2023': {
    barData: [
      { month: 'Jan', amount: 1000, Food: 350, Transport: 90, Shopping: 250, Bills: 200, Entertainment: 110 },
      { month: 'Feb', amount: 800, Food: 250, Transport: 70, Shopping: 150, Bills: 180, Entertainment: 80 },
      { month: 'Mar', amount: 1200, Food: 400, Transport: 100, Shopping: 300, Bills: 250, Entertainment: 150 },
      { month: 'Apr', amount: 950, Food: 300, Transport: 80, Shopping: 200, Bills: 200, Entertainment: 120 },
      { month: 'May', amount: 1400, Food: 500, Transport: 120, Shopping: 400, Bills: 300, Entertainment: 80 },
      { month: 'Jun', amount: 1100, Food: 350, Transport: 90, Shopping: 250, Bills: 250, Entertainment: 160 },
      { month: 'Jul', amount: 1200, Food: 400, Transport: 100, Shopping: 300, Bills: 250, Entertainment: 150 },
      { month: 'Aug', amount: 1300, Food: 450, Transport: 110, Shopping: 350, Bills: 300, Entertainment: 90 },
      { month: 'Sep', amount: 1100, Food: 350, Transport: 90, Shopping: 250, Bills: 250, Entertainment: 160 },
      { month: 'Oct', amount: 1500, Food: 600, Transport: 150, Shopping: 500, Bills: 300, Entertainment: 150 },
      { month: 'Nov', amount: 1200, Food: 400, Transport: 100, Shopping: 300, Bills: 250, Entertainment: 150 },
      { month: 'Dec', amount: 1300, Food: 450, Transport: 110, Shopping: 350, Bills: 300, Entertainment: 90 },
    ],
    pieData: [
      { name: 'Food', value: 6500 },
      { name: 'Transport', value: 2800 },
      { name: 'Shopping', value: 9500 },
      { name: 'Bills', value: 7000 },
      { name: 'Entertainment', value: 3200 },
    ],
    lastYearTotal: 16000,
  },
};



// Removed duplicate COLORS


const categoryKeys = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment'];

export default function YearlyCharts() {
  const [selectedYear, setSelectedYear] = useState('2024');
  const { barData, pieData, lastYearTotal } = yearlyData[selectedYear];

  // Yearly summary calculations
  const totalSpent = barData.reduce((sum, d) => sum + d.amount, 0);
  const avgMonth = Math.round(totalSpent / barData.length);
  const highestMonth = barData.reduce((max, d) => d.amount > max.amount ? d : max, barData[0]);
  const lowestMonth = barData.reduce((min, d) => d.amount < min.amount ? d : min, barData[0]);
  const noSpendMonths = barData.filter(d => d.amount === 0).length;
  const biggestExpense = Math.max(...barData.map(d => d.amount));

  // Top 3 categories
  const topCategories = [...pieData].sort((a, b) => b.value - a.value).slice(0, 3);

  // Budget (example)
  const yearlyBudget = 18000;
  const budgetUsed = Math.min(100, Math.round((totalSpent / yearlyBudget) * 100));

  // Recurring expenses (simulated)
  const recurring = [
    { name: 'Netflix', amount: 499 * 12 },
    { name: 'Gym', amount: 1200 * 12 },
  ];

  // Savings suggestion
  const highestCategory = topCategories[0];
  const savingsSuggestion = highestCategory.value > 0.4 * totalSpent
    ? `Consider reducing your ${highestCategory.name} expenses to save more.`
    : '';

  // Last year comparison (simulated)
  const percentChange = lastYearTotal ? Math.round(((totalSpent - lastYearTotal) / lastYearTotal) * 100) : 0;

  // Month-over-month trend data (line chart)
  const lineData = barData.map(d => ({ month: d.month, amount: d.amount }));


// Heatmap data (simulate hotness by amount)
// Removed unused heatmapColors
function getHeatColor(amount: number) {
  if (amount < 1000) return 'bg-blue-100';
  if (amount < 1200) return 'bg-blue-300';
  if (amount < 1400) return 'bg-green-200';
  if (amount < 1600) return 'bg-yellow-200';
  if (amount < 1800) return 'bg-orange-200';
  return 'bg-red-400';
}


  // CSV Export
  function exportCSV() {
    const rows = [
      ['Month', 'Amount'],
      ...barData.map(d => [d.month, d.amount])
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


  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28CFF'];

  return (
    <div className="flex flex-col gap-6">
      {/* Year Selection */}
      <div className="flex justify-end mb-2">
        <label className="mr-2 font-medium text-green-700">Year:</label>
        <select
          className="border rounded px-2 py-1 text-green-700 focus:outline-none focus:ring-2 focus:ring-green-400"
          value={selectedYear}
          onChange={e => setSelectedYear(e.target.value)}
        >
          {Object.keys(yearlyData).map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>
      {/* Summary Widgets */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
          <div className="text-xs text-gray-500">Total Spent</div>
          <div className="text-2xl font-bold text-green-700">₹{totalSpent}</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
          <div className="text-xs text-gray-500">Avg Monthly Spend</div>
          <div className="text-2xl font-bold text-green-700">₹{avgMonth}</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
          <div className="text-xs text-gray-500">Highest Month</div>
          <div className="text-lg font-bold text-green-600">{highestMonth.month}</div>
          <div className="text-sm">₹{highestMonth.amount}</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
          <div className="text-xs text-gray-500">Lowest Month</div>
          <div className="text-lg font-bold text-red-600">{lowestMonth.month}</div>
          <div className="text-sm">₹{lowestMonth.amount}</div>
        </div>
      </div>

      {/* Top Categories & Year Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow p-4">
          <div className="font-semibold text-green-700 mb-2">Top Categories</div>
          <ul className="text-sm">
            {topCategories.map(cat => (
              <li key={cat.name} className="flex justify-between py-1">
                <span>{cat.name}</span>
                <span className="font-semibold">₹{cat.value} ({Math.round((cat.value/totalSpent)*100)}%)</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white rounded-xl shadow p-4 flex flex-col gap-2">
          <div className="font-semibold text-green-700 mb-1">This Year vs Last Year</div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold">₹{totalSpent}</span>
            <span className={percentChange >= 0 ? 'text-green-600' : 'text-red-600'}>
              {percentChange >= 0 ? '▲' : '▼'} {Math.abs(percentChange)}%
            </span>
            <span className="text-xs text-gray-500">(Last: ₹{lastYearTotal})</span>
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
            <span>₹{totalSpent} / ₹{yearlyBudget}</span>
            <span>{budgetUsed}% used</span>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 flex flex-col gap-2">
          <div className="font-semibold text-green-700 mb-2">Export Data</div>
          <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 w-fit" onClick={exportCSV}>Download CSV</button>
        </div>
      </div>

      {/* Biggest Expense, No Spend Months, Recurring, Suggestion */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow p-4 flex flex-col gap-2">
          <div className="font-semibold text-green-700 mb-1">Biggest Single Month Expense</div>
          <div className="text-2xl font-bold text-green-700">₹{biggestExpense}</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 flex flex-col gap-2">
          <div className="font-semibold text-green-700 mb-1">No Spend Months</div>
          <div className="text-2xl font-bold text-green-700">{noSpendMonths}</div>
        </div>
      </div>

      {/* Recurring Expenses & Savings Suggestion */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow p-4">
          <div className="font-semibold text-green-700 mb-2">Recurring Expenses</div>
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
          <div className="font-semibold text-green-700 mb-2">Savings Suggestion</div>
          <div className="text-sm text-gray-700">{savingsSuggestion || 'Your spending is well balanced!'}</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
          <h3 className="font-semibold mb-2 text-green-700">Monthwise Expenses (Bar)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="amount" fill="#34D399" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
          <h3 className="font-semibold mb-2 text-green-700">Spend by Category (Pie)</h3>
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
      </div>

      {/* Month-over-Month Trend (Line Chart) */}
      <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
        <h3 className="font-semibold mb-2 text-green-700">Month-over-Month Trend (Line)</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={lineData}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="amount" stroke="#00C49F" strokeWidth={2} dot={true} />
            <ReferenceLine y={avgMonth} label="Avg" stroke="#FF8042" strokeDasharray="3 3" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Category Trend (Stacked Bar) */}
      <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
        <h3 className="font-semibold mb-2 text-green-700">Category Trend (Stacked Bar)</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={barData}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            {categoryKeys.map((key, idx) => (
              <Bar key={key} dataKey={key} stackId="a" fill={COLORS[idx % COLORS.length]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Expense Heatmap */}
      <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
        <h3 className="font-semibold mb-2 text-green-700">Expense Heatmap</h3>
        <div className="grid grid-cols-6 gap-2 w-full">
          {barData.map((d, idx) => (
            <div key={d.month} className={`rounded-lg h-10 flex flex-col items-center justify-center text-xs font-semibold text-gray-700 ${getHeatColor(d.amount)}`} title={`₹${d.amount}`}>
              <span>{d.month}</span>
              <span>₹{d.amount}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
