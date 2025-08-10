import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
  AreaChart,
  Area,
  ReferenceLine,
} from 'recharts';
import { AppDispatch, RootState } from '../../store/store';
import { fetchCustomRangeDetailsStart } from '../../store/slices/dashboardSlice';
import DateRangePicker from '../../components/DateRangePicker';

interface DateRange {
  startDate: string;
  endDate: string;
}

interface DrillDownState {
  selectedCategory: string | null;
  selectedDateRange: { start: string; end: string } | null;
  chartView: 'overview' | 'category' | 'daily';
  categoryTransactions: any[];
  dateTransactions: any[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C'];

const currencySymbols: { [key: string]: string } = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  INR: '₹',
  CAD: 'C$',
  AUD: 'A$',
  CNY: '¥',
};

interface CustomRangeChartsProps {
  onFilterChange?: (total: number) => void;
}

const CustomRangeCharts: React.FC<CustomRangeChartsProps> = ({ onFilterChange }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { customRangeDetails, loadingCustomRangeDetails, error } = useSelector((state: RootState) => state.dashboard);
  const { currency = 'INR' } = { currency: 'INR' }; // Mock currency setting
  const previousTotal = useRef<number | null>(null);
  
  const [selectedRange, setSelectedRange] = useState<DateRange>({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Last 7 days
    endDate: new Date().toISOString().split('T')[0],
  });

  // Drill-down state management
  const [drillDown, setDrillDown] = useState<DrillDownState>({
    selectedCategory: null,
    selectedDateRange: null,
    chartView: 'overview',
    categoryTransactions: [],
    dateTransactions: []
  });

  // Chart view state
  const [activeChartView, setActiveChartView] = useState<'pie' | 'bar' | 'line' | 'area'>('pie');
  const [showComparison, setShowComparison] = useState(false);

  useEffect(() => {
    if (selectedRange.startDate && selectedRange.endDate) {
      dispatch(fetchCustomRangeDetailsStart({ 
        startDate: selectedRange.startDate, 
        endDate: selectedRange.endDate 
      }));
    }
  }, [dispatch, selectedRange]);

  // Notify parent component when data changes
  useEffect(() => {
    if (customRangeDetails && onFilterChange && customRangeDetails.totalAmount !== previousTotal.current) {
      previousTotal.current = customRangeDetails.totalAmount;
      onFilterChange(customRangeDetails.totalAmount);
    }
  }, [customRangeDetails, onFilterChange]);

  // Handle date range change
  const handleDateRangeChange = (range: DateRange) => {
    setSelectedRange(range);
    previousTotal.current = null; // Reset previous total when range changes
    // Reset drill-down when date range changes
    setDrillDown({
      selectedCategory: null,
      selectedDateRange: null,
      chartView: 'overview',
      categoryTransactions: [],
      dateTransactions: []
    });
  };

  // Interactive chart handlers
  const handleCategoryClick = useCallback((data: any) => {
    setDrillDown(prev => ({
      ...prev,
      selectedCategory: data.name,
      chartView: 'category'
    }));
  }, []);

  const handleDateClick = useCallback((data: any) => {
    setDrillDown(prev => ({
      ...prev,
      selectedDateRange: { start: data.date, end: data.date },
      chartView: 'daily'
    }));
  }, []);

  const resetDrillDown = useCallback(() => {
    setDrillDown({
      selectedCategory: null,
      selectedDateRange: null,
      chartView: 'overview',
      categoryTransactions: [],
      dateTransactions: []
    });
  }, []);

  // Custom tooltip components with rich information
  const CustomPieTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800 dark:text-gray-200">{data.name}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Amount: <span className="font-bold text-blue-600">{currencySymbols[currency]}{data.value}</span>
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Percentage: <span className="font-bold text-green-600">{data.payload?.percentage}%</span>
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            Click to drill down
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomBarTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const fullDate = new Date(data.payload?.date || label);
      const weekday = fullDate.toLocaleDateString('en-US', { weekday: 'long' });
      
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800 dark:text-gray-200">{weekday}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Amount: <span className="font-bold text-blue-600">{currencySymbols[currency]}{data.value}</span>
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            Click to view details
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
          <p className="font-semibold text-gray-800 dark:text-gray-200">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm text-gray-600 dark:text-gray-400">
              {entry.name}: <span className="font-bold" style={{ color: entry.color }}>{currencySymbols[currency]}{entry.value}</span>
            </p>
          ))}
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            Cumulative spending trend
          </p>
        </div>
      );
    }
    return null;
  };

  // CSV Export
  const exportToCSV = () => {
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
  };

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
            onClick={exportToCSV}
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
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">{currencySymbols[currency]}{totalExpenses || totalAmount}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 flex flex-col items-center">
          <div className="text-xs text-gray-500 dark:text-gray-400">Total Income</div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{currencySymbols[currency]}{totalIncome || 0}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 flex flex-col items-center">
          <div className="text-xs text-gray-500 dark:text-gray-400">Total Savings</div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{currencySymbols[currency]}{totalSavings || 0}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 flex flex-col items-center">
          <div className="text-xs text-gray-500 dark:text-gray-400">Net Income</div>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{currencySymbols[currency]}{netIncome || 0}</div>
        </div>
      </div>

      {/* Interactive Chart Controls */}
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 w-full overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">Interactive Analysis</h3>
            {drillDown.chartView !== 'overview' && (
              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={resetDrillDown}
                  className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  ← Back to Overview
                </button>
                {drillDown.selectedCategory && (
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    | Category: <span className="font-medium">{drillDown.selectedCategory}</span>
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            {['pie', 'bar', 'line', 'area'].map((view) => (
              <button
                key={view}
                onClick={() => setActiveChartView(view as any)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                  activeChartView === view
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {view.charAt(0).toUpperCase() + view.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Enhanced Interactive Charts */}
  <div className="h-80">
          {activeChartView === 'pie' && categoryBreakdown.length > 0 && (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryBreakdown}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  innerRadius={40}
                  label={(entry) => `${entry.name}: ${entry.percentage}%`}
                  onClick={handleCategoryClick}
                  style={{ cursor: 'pointer' }}
                >
                  {categoryBreakdown.map((entry, idx) => (
                    <Cell 
                      key={`cell-${idx}`} 
                      fill={COLORS[idx % COLORS.length]}
                      stroke={drillDown.selectedCategory === entry.name ? '#333' : 'none'}
                      strokeWidth={drillDown.selectedCategory === entry.name ? 3 : 0}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}

          {activeChartView === 'bar' && chartData.length > 0 && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis 
                  dataKey="displayDate" 
                  label={{ value: 'Date', position: 'insideBottom', offset: -5 }} 
                />
                <YAxis />
                <Tooltip content={<CustomBarTooltip />} />
                <Legend />
                <Bar 
                  dataKey="amount" 
                  fill="#0088FE"
                  onClick={handleDateClick}
                  style={{ cursor: 'pointer' }}
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={drillDown.selectedDateRange?.start === entry.date ? '#FF8042' : '#0088FE'}
                    />
                  ))}
                </Bar>
                <ReferenceLine 
                  y={avgDaily} 
                  stroke="#00C49F" 
                  strokeDasharray="3 3"
                  label="Average"
                />
              </BarChart>
            </ResponsiveContainer>
          )}

          {activeChartView === 'line' && lineData.length > 0 && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData}>
                <XAxis 
                  dataKey="displayDate"
                  label={{ value: 'Date', position: 'insideBottom', offset: -5 }} 
                />
                <YAxis />
                <Tooltip content={<CustomLineTooltip />} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="cumulative" 
                  stroke="#00C49F" 
                  strokeWidth={3}
                  name="Cumulative Amount"
                  dot={{ r: 6, strokeWidth: 2, fill: '#00C49F' }}
                  activeDot={{ r: 8, strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#FF8042"
                  strokeWidth={2}
                  name="Daily Amount"
                  dot={{ r: 4, strokeWidth: 1, fill: '#FF8042' }}
                />
                <ReferenceLine 
                  y={avgDaily * dayCount} 
                  stroke="#ff7300" 
                  strokeDasharray="5 5"
                  label="Expected Total"
                />
              </LineChart>
            </ResponsiveContainer>
          )}

          {activeChartView === 'area' && lineData.length > 0 && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={lineData}>
                <XAxis 
                  dataKey="displayDate"
                  label={{ value: 'Date', position: 'insideBottom', offset: -5 }} 
                />
                <YAxis />
                <Tooltip content={<CustomLineTooltip />} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="cumulative"
                  stackId="1"
                  stroke="#0088FE"
                  fill="#0088FE"
                  fillOpacity={0.6}
                  name="Cumulative Spending"
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stackId="2"
                  stroke="#00C49F"
                  fill="#00C49F"
                  fillOpacity={0.4}
                  name="Daily Spending"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Chart View Toggle */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="showComparison"
              checked={showComparison}
              onChange={(e) => setShowComparison(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="showComparison" className="text-sm text-gray-600 dark:text-gray-400">
              Show comparison metrics
            </label>
          </div>
          <button
            onClick={exportToCSV}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition duration-200"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Category Analysis */}
      {averagePerCategory.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 w-full overflow-hidden">
          <h3 className="font-semibold mb-4 text-purple-700 dark:text-purple-300">Category Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {averagePerCategory.slice(0, 6).map((category, index) => (
              <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                <div className="font-medium text-gray-800 dark:text-gray-200 mb-1">{category.category}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <div>Total: {currencySymbols[currency]} {category.totalAmount.toFixed(2)}</div>
                  <div>Avg/Day: {currencySymbols[currency]} {category.avgAmount.toFixed(2)}</div>
                  <div>Transactions: {category.transactionCount}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

  </div>
  );
};

export default CustomRangeCharts;
