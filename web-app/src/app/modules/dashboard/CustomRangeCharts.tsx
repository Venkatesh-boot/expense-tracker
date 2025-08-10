import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Legend, LineChart, Line, ReferenceLine } from 'recharts';
import { AppDispatch, RootState } from '../../store/store';
import { fetchCustomRangeDetailsStart } from '../../store/slices/dashboardSlice';
import DateRangePicker, { DateRange } from '../../components/DateRangePicker';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28CFF'];

export default function CustomRangeCharts() {
  const dispatch = useDispatch<AppDispatch>();
  const { customRangeDetails, loadingCustomRangeDetails, error } = useSelector((state: RootState) => state.dashboard);
  
  const [selectedRange, setSelectedRange] = useState<DateRange>({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Last 7 days
    endDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (selectedRange.startDate && selectedRange.endDate) {
      dispatch(fetchCustomRangeDetailsStart({ 
        startDate: selectedRange.startDate, 
        endDate: selectedRange.endDate 
      }));
    }
  }, [dispatch, selectedRange]);

  // Handle date range change
  const handleDateRangeChange = (range: DateRange) => {
    setSelectedRange(range);
  };

  // CSV Export
  function exportCSV() {
    if (!customRangeDetails) return;
    
    const csvData = [
      ['Custom Range Details', `${selectedRange.startDate} to ${selectedRange.endDate}`],
      ['Total Amount', customRangeDetails.totalAmount],
      ['Total Expenses', customRangeDetails.totalExpenses],
      ['Total Income', customRangeDetails.totalIncome],
      ['Total Savings', customRangeDetails.totalSavings],
      ['Net Income', customRangeDetails.netIncome],
      ['Day Count', customRangeDetails.dayCount],
      ['Average Daily', customRangeDetails.avgDaily],
      ['Max Daily', customRangeDetails.maxDaily],
      ['Min Daily', customRangeDetails.minDaily],
      ['Transaction Count', customRangeDetails.transactionCount],
      ['Income Transactions', customRangeDetails.incomeTransactionCount],
      ['Savings Transactions', customRangeDetails.savingsTransactionCount],
      ['Most Active Category', customRangeDetails.mostActiveCategory],
      ['', ''],
      ['Category Breakdown', ''],
      ['Category', 'Amount', 'Percentage'],
      ...customRangeDetails.categoryBreakdown.map(c => [c.name, c.value, `${c.percentage}%`]),
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `custom-range-details-${selectedRange.startDate}-to-${selectedRange.endDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  if (loadingCustomRangeDetails) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-lg">Loading custom range details...</div>
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

  if (!customRangeDetails) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-gray-500">No data available for the selected date range</div>
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
    avgDaily, 
    maxDaily, 
    minDaily, 
    transactionCount,
    incomeTransactionCount,
    savingsTransactionCount,
    categoryBreakdown, 
    dailyExpenses, 
    startDate,
    endDate,
    dayCount,
    topExpenseDay,
    lowestExpenseDay,
    mostActiveCategory,
    averagePerCategory = []
  } = customRangeDetails;

  // Format the daily expenses data for charts
  const chartData = dailyExpenses.map(expense => ({
    ...expense,
    displayDate: new Date(expense.date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    }),
  }));

  // Calculate cumulative data for line chart
  let cumulative = 0;
  const lineData = dailyExpenses.map(d => {
    cumulative += d.amount;
    return { 
      date: d.date, 
      displayDate: new Date(d.date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      }),
      cumulative,
      amount: d.amount
    };
  });

  // Calculate savings rate
  const savingsRate = totalIncome > 0 ? Math.round((totalSavings / totalIncome) * 100) : 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Date Range Selection */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-2 sm:mb-4">
        <div className="flex-1">
          <label className="block text-gray-700 dark:text-gray-200 mb-1">Custom Date Range</label>
          <DateRangePicker
            value={selectedRange}
            onChange={handleDateRangeChange}
            placeholder="Select date range"
            maxDate={new Date().toISOString().split('T')[0]}
            className="w-full"
          />
        </div>
        <div className="flex-1 flex items-end">
          <button 
            onClick={exportCSV}
            className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm sm:text-base w-full sm:w-auto"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Summary Widgets */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 flex flex-col items-center">
          <div className="text-xs text-gray-500 dark:text-gray-400">Total Expenses</div>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">₹{totalExpenses || totalAmount}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 flex flex-col items-center">
          <div className="text-xs text-gray-500 dark:text-gray-400">Total Income</div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">₹{totalIncome || 0}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 flex flex-col items-center">
          <div className="text-xs text-gray-500 dark:text-gray-400">Total Savings</div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">₹{totalSavings || 0}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 flex flex-col items-center">
          <div className="text-xs text-gray-500 dark:text-gray-400">Net Income</div>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">₹{netIncome || 0}</div>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 flex flex-col items-center">
          <div className="text-xs text-gray-500 dark:text-gray-400">Day Count</div>
          <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{dayCount}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 flex flex-col items-center">
          <div className="text-xs text-gray-500 dark:text-gray-400">Avg Daily</div>
          <div className="text-2xl font-bold text-green-700 dark:text-green-300">₹{avgDaily}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 flex flex-col items-center">
          <div className="text-xs text-gray-500 dark:text-gray-400">Savings Rate</div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-300">{savingsRate}%</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 flex flex-col items-center">
          <div className="text-xs text-gray-500 dark:text-gray-400">Transactions</div>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-300">{transactionCount}</div>
        </div>
      </div>

      {/* Transaction Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 flex flex-col items-center">
          <div className="text-xs text-gray-500 dark:text-gray-400">Expense Transactions</div>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">{transactionCount - (incomeTransactionCount || 0) - (savingsTransactionCount || 0)}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 flex flex-col items-center">
          <div className="text-xs text-gray-500 dark:text-gray-400">Income Transactions</div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{incomeTransactionCount || 0}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 flex flex-col items-center">
          <div className="text-xs text-gray-500 dark:text-gray-400">Savings Transactions</div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{savingsTransactionCount || 0}</div>
        </div>
      </div>

      {/* Peak and Low Days */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 flex flex-col items-center">
          <div className="text-xs text-gray-500 dark:text-gray-400">Highest Expense Day</div>
          <div className="text-lg font-bold text-red-600 dark:text-red-400">
            {topExpenseDay ? new Date(topExpenseDay.date).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric' 
            }) : 'N/A'}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">₹{topExpenseDay?.amount || 0}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 flex flex-col items-center">
          <div className="text-xs text-gray-500 dark:text-gray-400">Lowest Expense Day</div>
          <div className="text-lg font-bold text-green-600 dark:text-green-400">
            {lowestExpenseDay ? new Date(lowestExpenseDay.date).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric' 
            }) : 'N/A'}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">₹{lowestExpenseDay?.amount || 0}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 flex flex-col items-center">
          <div className="text-xs text-gray-500 dark:text-gray-400">Most Active Category</div>
          <div className="text-lg font-bold text-purple-600 dark:text-purple-400">{mostActiveCategory || 'N/A'}</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 flex flex-col items-center">
          <h3 className="font-semibold mb-2 text-blue-700 dark:text-blue-300">Financial Breakdown (Pie)</h3>
          {totalIncome > 0 || totalExpenses > 0 || totalSavings > 0 ? (
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
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-gray-500 dark:text-gray-400 py-8">No financial data to display</div>
          )}
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 flex flex-col items-center">
          <h3 className="font-semibold mb-2 text-green-700 dark:text-green-300">Category Breakdown (Pie)</h3>
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
            <div className="text-gray-500 dark:text-gray-400 py-8">No expense data to display</div>
          )}
        </div>
      </div>

      {/* Daily Expenses Charts */}
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 flex flex-col items-center">
          <h3 className="font-semibold mb-2 text-blue-700 dark:text-blue-300">Daily Expenses (Bar)</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <XAxis 
                  dataKey="displayDate" 
                  label={{ value: 'Date', position: 'insideBottom', offset: -5 }} 
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="amount" fill="#0088FE" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-gray-500 dark:text-gray-400 py-8">No daily expense data to display</div>
          )}
        </div>
      </div>

      {/* Cumulative Line Chart */}
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 flex flex-col items-center">
          <h3 className="font-semibold mb-2 text-green-700 dark:text-green-300">Cumulative Expenses (Line)</h3>
          {lineData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={lineData}>
                <XAxis 
                  dataKey="displayDate"
                  label={{ value: 'Date', position: 'insideBottom', offset: -5 }} 
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="cumulative" 
                  stroke="#00C49F" 
                  strokeWidth={2}
                  name="Cumulative Amount"
                />
                <ReferenceLine 
                  y={avgDaily * dayCount} 
                  stroke="#ff7300" 
                  strokeDasharray="5 5"
                  label="Expected Total"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-gray-500 dark:text-gray-400 py-8">No cumulative data to display</div>
          )}
        </div>
      </div>

      {/* Category Analysis */}
      {averagePerCategory.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
          <h3 className="font-semibold mb-4 text-purple-700 dark:text-purple-300">Category Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {averagePerCategory.slice(0, 6).map((category, index) => (
              <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                <div className="font-medium text-gray-800 dark:text-gray-200 mb-1">{category.category}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <div>Avg: ₹{category.avgAmount}</div>
                  <div>Total: ₹{category.totalAmount}</div>
                  <div>Transactions: {category.transactionCount}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
