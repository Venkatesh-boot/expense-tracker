import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Legend, LineChart, Line, ReferenceLine, AreaChart, Area } from 'recharts';
import { AppDispatch, RootState } from '../../store/store';
import { fetchDailyDetailsStart } from '../../store/slices/dashboardSlice';

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

interface DailyChartsProps {
  onFilterChange?: (total: number) => void;
}

export default function DailyCharts({ onFilterChange }: DailyChartsProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { dailyDetails, loadingDailyDetails, error } = useSelector((state: RootState) => state.dashboard);
  const previousTotal = useRef<number | null>(null);
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); // YYYY-MM-DD format
  const [activeChartView, setActiveChartView] = useState<'pie' | 'bar' | 'line' | 'area'>('bar');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedHour, setSelectedHour] = useState<number | null>(null);

  useEffect(() => {
    dispatch(fetchDailyDetailsStart({ date: selectedDate }));
  }, [dispatch, selectedDate]);

  // Notify parent component when data changes
  useEffect(() => {
    if (dailyDetails && onFilterChange && dailyDetails.totalAmount !== previousTotal.current) {
      previousTotal.current = dailyDetails.totalAmount;
      onFilterChange(dailyDetails.totalAmount);
    }
  }, [dailyDetails, onFilterChange]);

  // Handle date change
  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    setSelectedCategory(null);
    setSelectedHour(null);
    previousTotal.current = null; // Reset previous total when date changes
  };

  // Interactive chart handlers
  const handleCategoryClick = useCallback((data: any) => {
    setSelectedCategory(data.name);
  }, []);

  const handleHourClick = useCallback((data: any) => {
    setSelectedHour(data.hour);
  }, []);

  const resetSelection = useCallback(() => {
    setSelectedCategory(null);
    setSelectedHour(null);
  }, []);

  // Custom tooltip components
  const CustomPieTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800 dark:text-gray-200">{data.name}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Amount: <span className="font-bold text-blue-600">₹{data.value}</span>
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
      const timeLabel = formatHour(Number(label));
      
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800 dark:text-gray-200">{timeLabel}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Amount: <span className="font-bold text-blue-600">₹{data.value}</span>
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            Click to analyze this hour
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
          <p className="font-semibold text-gray-800 dark:text-gray-200">{formatHour(Number(label))}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm text-gray-600 dark:text-gray-400">
              {entry.name}: <span className="font-bold" style={{ color: entry.color }}>₹{entry.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Format hour for display
  const formatHour = (hour: number) => {
    if (hour === 0) return '12 AM';
    if (hour < 12) return `${hour} AM`;
    if (hour === 12) return '12 PM';
    return `${hour - 12} PM`;
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
    { name: 'Morning (6-12)', value: expensesByTimeOfDay?.morning || 0 },
    { name: 'Afternoon (12-18)', value: expensesByTimeOfDay?.afternoon || 0 },
    { name: 'Evening (18-22)', value: expensesByTimeOfDay?.evening || 0 },
    { name: 'Night (22-6)', value: expensesByTimeOfDay?.night || 0 },
  ];

  // Cumulative spend for line chart
  let cumulative = 0;
  const lineData = hourlyExpenses.map(h => {
    cumulative += h.amount;
    return { hour: h.hour, cumulative, amount: h.amount };
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Date Selection */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-2 sm:mb-4">
        <div className="flex-1">
          <label className="block text-gray-700 dark:text-gray-200 mb-1">Date</label>
          <input
            type="date"
            className="w-full px-2 py-2 sm:px-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm sm:text-base dark:bg-gray-700 dark:text-gray-200"
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

      {/* Interactive Selection Details */}
      {(selectedCategory || selectedHour !== null) && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 mb-4">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-semibold text-gray-800 dark:text-gray-200">
              {selectedCategory && `Category Analysis: ${selectedCategory}`}
              {selectedHour !== null && `Hour ${selectedHour} Analysis (${formatHour(selectedHour)})`}
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
                  <span className="font-medium">Total Amount:</span> ₹
                  {categoryBreakdown.find(c => c.name === selectedCategory)?.value || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Percentage:</span> 
                  {categoryBreakdown.find(c => c.name === selectedCategory)?.percentage || 0}%
                </div>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <div className="font-medium mb-1">Daily Insights:</div>
                <ul className="space-y-1 text-xs">
                  <li>• % of daily total: {categoryBreakdown.find(c => c.name === selectedCategory)?.percentage || 0}%</li>
                  <li>• Daily budget impact: ₹{Math.round((categoryBreakdown.find(c => c.name === selectedCategory)?.value || 0))}</li>
                  <li>• Top category: {topExpenseCategory === selectedCategory ? 'Yes' : 'No'}</li>
                </ul>
              </div>
            </div>
          )}

          {selectedHour !== null && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Hour:</span> {formatHour(selectedHour)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Amount:</span> ₹
                  {hourlyExpenses.find(h => h.hour === selectedHour)?.amount || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Time Period:</span> 
                  {selectedHour >= 6 && selectedHour < 12 ? 'Morning' :
                   selectedHour >= 12 && selectedHour < 18 ? 'Afternoon' :
                   selectedHour >= 18 && selectedHour < 22 ? 'Evening' : 'Night'}
                </div>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <div className="font-medium mb-1">Hourly Analysis:</div>
                <ul className="space-y-1 text-xs">
                  <li>• vs Hourly Average: {((hourlyExpenses.find(h => h.hour === selectedHour)?.amount || 0) / Math.max(1, avgHourly) * 100 - 100).toFixed(1)}%</li>
                  <li>• vs Peak Hour: {((hourlyExpenses.find(h => h.hour === selectedHour)?.amount || 0) / Math.max(1, maxHourly) * 100).toFixed(1)}%</li>
                  <li>• Cumulative up to this hour: ₹{lineData.find(d => d.hour === selectedHour)?.cumulative || 0}</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

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

      {/* Enhanced Interactive Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 flex flex-col items-center">
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
                <Tooltip content={<CustomPieTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-gray-500 dark:text-gray-400 py-8">No expense data to display</div>
          )}
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 flex flex-col items-center">
          <h3 className="font-semibold mb-2 text-blue-700 dark:text-blue-300">Time of Day Breakdown</h3>
          {timeOfDayData.some(d => d.value > 0) ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={timeOfDayData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={(entry) => `₹${entry.value}`}
                >
                  {timeOfDayData.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    `₹${value}`,
                    name
                  ]}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-gray-500 dark:text-gray-400 py-8">No time-based data to display</div>
          )}
        </div>
      </div>

      {/* Enhanced Hourly Expenses Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 flex flex-col items-center">
        <div className="flex justify-between items-center w-full mb-4">
          <h3 className="font-semibold text-blue-700 dark:text-blue-300">Hourly Expense Analysis</h3>
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
        {hourlyExpenses.length > 0 ? (
          <>
            {activeChartView === 'bar' && (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={hourlyExpenses}>
                <XAxis 
                  dataKey="hour" 
                  label={{ value: 'Hour', position: 'insideBottom', offset: -5 }}
                  tickFormatter={formatHour}
                  tick={{ fontSize: 12 }}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomBarTooltip />} />
                <Legend />
                <Bar 
                  dataKey="amount" 
                  fill="#0088FE"
                  onClick={handleHourClick}
                  style={{ cursor: 'pointer' }}
                  radius={[4, 4, 0, 0]}
                >
                  {hourlyExpenses.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={
                        selectedHour === entry.hour ? '#FF8042' :
                        entry.amount > avgHourly ? '#00C49F' : '#0088FE'
                      }
                    />
                  ))}
                </Bar>
                <ReferenceLine 
                  y={avgHourly} 
                  stroke="#FFBB28" 
                  strokeDasharray="3 3"
                  label="Avg"
                />
              </BarChart>
              </ResponsiveContainer>
            )}
            
            {activeChartView === 'line' && (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={hourlyExpenses}>
                  <XAxis 
                    dataKey="hour"
                    label={{ value: 'Hour', position: 'insideBottom', offset: -5 }}
                    tickFormatter={formatHour}
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
                    name="Hourly Amount"
                    dot={{ r: 5, strokeWidth: 2, fill: '#0088FE' }}
                    activeDot={{ r: 7, strokeWidth: 2, fill: '#FF8042' }}
                  />
                  <ReferenceLine 
                    y={avgHourly} 
                    stroke="#00C49F" 
                    strokeDasharray="3 3"
                    label="Average"
                  />
                  <ReferenceLine 
                    y={maxHourly} 
                    stroke="#FF8042" 
                    strokeDasharray="3 3"
                    label="Max"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
            
            {activeChartView === 'area' && (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={hourlyExpenses}>
                  <XAxis 
                    dataKey="hour"
                    label={{ value: 'Hour', position: 'insideBottom', offset: -5 }}
                    tickFormatter={formatHour}
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
                    name="Hourly Spending"
                  />
                  <ReferenceLine 
                    y={avgHourly} 
                    stroke="#00C49F" 
                    strokeDasharray="3 3"
                    label="Average"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </>
        ) : (
          <div className="text-gray-500 dark:text-gray-400 py-8">No hourly expense data to display</div>
        )}
      </div>

      {/* Enhanced Cumulative Spend Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 flex flex-col items-center">
        <h3 className="font-semibold mb-2 text-blue-700 dark:text-blue-300">Cumulative Spend Throughout Day</h3>
        {lineData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={lineData}>
              <XAxis 
                dataKey="hour" 
                tickFormatter={formatHour}
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
              <Line 
                type="monotone" 
                dataKey="amount" 
                stroke="#0088FE" 
                strokeWidth={2}
                name="Hourly Amount"
                dot={{ r: 4, strokeWidth: 1, fill: '#0088FE' }}
              />
              <ReferenceLine
                y={dailyBudget}
                label="Budget"
                stroke="#FF8042"
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
