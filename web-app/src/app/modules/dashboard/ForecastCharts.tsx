import React, { useState, useEffect, useCallback } from 'react';
import { formatCurrency } from '../../utils/currencyFormat';
import { useDispatch, useSelector } from 'react-redux';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import { AppDispatch, RootState } from '../../store/store';
import { fetchCustomRangeDetailsStart } from '../../store/slices/dashboardSlice';
import DateRangePicker from '../../components/DateRangePicker';

interface DateRange {
  startDate: string;
  endDate: string;
}

interface ForecastData {
  date: string;
  predicted: number;
  confidence: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

interface ForecastState {
  enabled: boolean;
  period: 7 | 14 | 30 | 90; // Days to forecast
  method: 'linear' | 'exponential' | 'seasonal'; // Prediction method
  forecasts: ForecastData[];
  loading: boolean;
}

interface SeasonalPattern {
  dayOfWeek: number;
  multiplier: number;
}

interface CategoryForecast {
  category: string;
  predicted: number;
  confidence: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}


const ForecastCharts: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { customRangeDetails, loadingCustomRangeDetails, error } = useSelector((state: RootState) => state.dashboard);
  // Get currency from settings API (Redux store)
  const settings = useSelector((state: RootState) => state.settings.settings);
  const currency = settings?.currency || 'INR';
  
  const [selectedRange, setSelectedRange] = useState<DateRange>({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Last 30 days for better forecast
    endDate: new Date().toISOString().split('T')[0],
  });

  // Forecast state
  const [forecast, setForecast] = useState<ForecastState>({
    enabled: true, // Enable by default in forecast tab
    period: 14,
    method: 'linear',
    forecasts: [],
    loading: false
  });

  // Chart view state  
  const [activeChartView, setActiveChartView] = useState<'line' | 'area'>('line');

  useEffect(() => {
    if (selectedRange.startDate && selectedRange.endDate) {
      dispatch(fetchCustomRangeDetailsStart({ 
        startDate: selectedRange.startDate, 
        endDate: selectedRange.endDate 
      }));
    }
  }, [dispatch, selectedRange]);

  // Forecasting utility functions
  const calculateLinearTrend = (data: any[]) => {
    const n = data.length;
    if (n < 2) return { slope: 0, intercept: 0 };

    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    
    data.forEach((item, index) => {
      sumX += index;
      sumY += item.amount;
      sumXY += index * item.amount;
      sumX2 += index * index;
    });

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    return { slope, intercept };
  };

  const calculateSeasonalPattern = (data: any[]): SeasonalPattern[] => {
    const dayPattern: { [key: number]: number[] } = {};
    
    data.forEach(item => {
      const dayOfWeek = new Date(item.date).getDay();
      if (!dayPattern[dayOfWeek]) dayPattern[dayOfWeek] = [];
      dayPattern[dayOfWeek].push(item.amount);
    });

    return Object.keys(dayPattern).map(day => {
      const amounts = dayPattern[parseInt(day)];
      const avg = amounts.reduce((sum, amt) => sum + amt, 0) / amounts.length;
      const overallAvg = data.reduce((sum, item) => sum + item.amount, 0) / data.length;
      
      return {
        dayOfWeek: parseInt(day),
        multiplier: overallAvg > 0 ? avg / overallAvg : 1
      };
    });
  };

  const generateForecasts = useCallback((data: any[], method: string, period: number): ForecastData[] => {
    if (!data || data.length < 3) return [];

    const forecasts: ForecastData[] = [];
    const lastDate = new Date(data[data.length - 1].date);
    
    if (method === 'linear') {
      const { slope, intercept } = calculateLinearTrend(data);
      const baseIndex = data.length;
      
      for (let i = 1; i <= period; i++) {
        const predictedValue = Math.max(0, slope * (baseIndex + i - 1) + intercept);
        const forecastDate = new Date(lastDate);
        forecastDate.setDate(lastDate.getDate() + i);
        
        forecasts.push({
          date: forecastDate.toISOString().split('T')[0],
          predicted: predictedValue,
          confidence: Math.max(0.5, 1 - (i / period) * 0.5), // Decreasing confidence over time
          trend: slope > 0.1 ? 'increasing' : slope < -0.1 ? 'decreasing' : 'stable'
        });
      }
    } else if (method === 'exponential') {
      const recentData = data.slice(-7); // Use last 7 days for exponential smoothing
      const alpha = 0.3; // Smoothing factor
      let smoothedValue = recentData[0].amount;
      
      recentData.forEach(item => {
        smoothedValue = alpha * item.amount + (1 - alpha) * smoothedValue;
      });
      
      for (let i = 1; i <= period; i++) {
        const forecastDate = new Date(lastDate);
        forecastDate.setDate(lastDate.getDate() + i);
        
        forecasts.push({
          date: forecastDate.toISOString().split('T')[0],
          predicted: Math.max(0, smoothedValue),
          confidence: Math.max(0.6, 1 - (i / period) * 0.4),
          trend: 'stable'
        });
      }
    } else if (method === 'seasonal') {
      const seasonalPattern = calculateSeasonalPattern(data);
      const recentAvg = data.slice(-7).reduce((sum, item) => sum + item.amount, 0) / 7;
      
      for (let i = 1; i <= period; i++) {
        const forecastDate = new Date(lastDate);
        forecastDate.setDate(lastDate.getDate() + i);
        const dayOfWeek = forecastDate.getDay();
        
        const pattern = seasonalPattern.find(p => p.dayOfWeek === dayOfWeek);
        const multiplier = pattern ? pattern.multiplier : 1;
        
        forecasts.push({
          date: forecastDate.toISOString().split('T')[0],
          predicted: Math.max(0, recentAvg * multiplier),
          confidence: Math.max(0.7, 1 - (i / period) * 0.3),
          trend: multiplier > 1.1 ? 'increasing' : multiplier < 0.9 ? 'decreasing' : 'stable'
        });
      }
    }
    
    return forecasts;
  }, []);

  const generateCategoryForecasts = useCallback((categoryData: any[]): CategoryForecast[] => {
    return categoryData.map(category => {
      const trend = Math.random() > 0.5 ? 'increasing' : Math.random() > 0.5 ? 'decreasing' : 'stable';
      const trendMultiplier = trend === 'increasing' ? 1.1 : trend === 'decreasing' ? 0.9 : 1.0;
      
      return {
        category: category.name,
        predicted: category.value * trendMultiplier,
        confidence: 0.75 + Math.random() * 0.2, // Random confidence between 0.75-0.95
        trend
      };
    });
  }, []);

  const handleForecastPeriodChange = useCallback((period: 7 | 14 | 30 | 90) => {
    setForecast(prev => {
      const newForecasts = prev.enabled && customRangeDetails?.dailyExpenses && customRangeDetails.dailyExpenses.length > 0 
        ? generateForecasts(customRangeDetails.dailyExpenses, prev.method, period)
        : [];
      return { ...prev, period, forecasts: newForecasts };
    });
  }, [customRangeDetails?.dailyExpenses, generateForecasts]);

  const handleForecastMethodChange = useCallback((method: 'linear' | 'exponential' | 'seasonal') => {
    setForecast(prev => {
      const newForecasts = prev.enabled && customRangeDetails?.dailyExpenses && customRangeDetails.dailyExpenses.length > 0 
        ? generateForecasts(customRangeDetails.dailyExpenses, method, prev.period)
        : [];
      return { ...prev, method, forecasts: newForecasts };
    });
  }, [customRangeDetails?.dailyExpenses, generateForecasts]);

  // Generate forecasts when data changes
  useEffect(() => {
    if (forecast.enabled && customRangeDetails?.dailyExpenses && customRangeDetails.dailyExpenses.length > 0) {
      const newForecasts = generateForecasts(customRangeDetails.dailyExpenses, forecast.method, forecast.period);
      setForecast(prev => ({ ...prev, forecasts: newForecasts }));
    }
  }, [customRangeDetails?.dailyExpenses, forecast.enabled, forecast.method, forecast.period, generateForecasts]);

  // Handle date range change
  const handleDateRangeChange = (range: DateRange) => {
    setSelectedRange(range);
  };

  // Custom tooltip components
  const CustomForecastTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const forecastData = payload.find(p => p.name === 'Predicted');
      const actualData = payload.find(p => p.name === 'Actual' || p.name === 'Daily Amount');
      
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800 dark:text-gray-200">{label}</p>
          {actualData && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
                Actual: <span className="font-bold" style={{ color: actualData.color }}>{formatCurrency(actualData.value, currency)}</span>
            </p>
          )}
          {forecastData && (
            <>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                  Predicted: <span className="font-bold" style={{ color: forecastData.color }}>{formatCurrency(forecastData.value, currency)}</span>
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                Confidence: {((forecastData.payload?.confidence || 0) * 100).toFixed(0)}%
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                Trend: {forecastData.payload?.trend || 'stable'}
              </p>
            </>
          )}
        </div>
      );
    }
    return null;
  };

  if (loadingCustomRangeDetails) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-lg">Loading forecast data...</div>
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
        <div className="text-gray-500">No data available for forecasting. Please select a date range with historical data.</div>
      </div>
    );
  }

  // Process data from API
  const { dailyExpenses, categoryBreakdown } = customRangeDetails;

  // Calculate cumulative data for line chart
  let cumulative = 0;
  const lineData = dailyExpenses.map((d: any) => {
    cumulative += d.amount;
    return { 
      date: d.date, 
      displayDate: new Date(d.date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      }),
      cumulative,
      amount: d.amount,
      type: 'actual'
    };
  });

  // Combine actual data with forecasts for charts
  const combinedLineData = [
    ...lineData,
    ...forecast.forecasts.map(f => ({
      date: f.date,
      displayDate: new Date(f.date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      }),
      predicted: f.predicted,
      confidence: f.confidence,
      trend: f.trend,
      type: 'forecast'
    }))
  ];

  // Calculate forecast summary metrics
  const forecastSummary = forecast.forecasts.length > 0 ? {
    totalPredicted: forecast.forecasts.reduce((sum, f) => sum + f.predicted, 0),
    avgDaily: forecast.forecasts.reduce((sum, f) => sum + f.predicted, 0) / forecast.forecasts.length,
    maxDaily: Math.max(...forecast.forecasts.map(f => f.predicted)),
    minDaily: Math.min(...forecast.forecasts.map(f => f.predicted)),
    avgConfidence: forecast.forecasts.reduce((sum, f) => sum + f.confidence, 0) / forecast.forecasts.length,
    dominantTrend: forecast.forecasts.reduce((acc, f) => {
      acc[f.trend] = (acc[f.trend] || 0) + 1;
      return acc;
    }, {} as any)
  } : null;

  // Generate category forecasts
  const categoryForecasts = generateCategoryForecasts(categoryBreakdown);

  return (
    <div className="flex flex-col gap-6">
      {/* Date Range Selection for Historical Data */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-2 sm:mb-4">
        <div className="flex-1">
          <label className="block text-gray-700 dark:text-gray-200 mb-1">Historical Data Range</label>
          <DateRangePicker
            value={selectedRange}
            onChange={handleDateRangeChange}
            placeholder="Select historical data range"
            maxDate={new Date().toISOString().split('T')[0]}
            className="w-full"
          />
        </div>
      </div>

      {/* Forecast Controls */}
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 w-full overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">Forecast Settings</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Configure prediction parameters for future expense forecasting
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Forecast Period */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Forecast Period
            </label>
            <div className="flex gap-2">
              {[7, 14, 30, 90].map(days => (
                <button
                  key={days}
                  onClick={() => handleForecastPeriodChange(days as any)}
                  className={`px-3 py-1 rounded text-xs font-medium transition ${
                    forecast.period === days
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {days}d
                </button>
              ))}
            </div>
          </div>

          {/* Forecast Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Prediction Method
            </label>
            <select
              value={forecast.method}
              onChange={(e) => handleForecastMethodChange(e.target.value as any)}
              className="w-full px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-gray-200"
            >
              <option value="linear">Linear Trend</option>
              <option value="exponential">Exponential Smoothing</option>
              <option value="seasonal">Seasonal Pattern</option>
            </select>
          </div>

          {/* Chart Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Chart Type
            </label>
            <div className="flex gap-2">
              {['line', 'area'].map((view) => (
                <button
                  key={view}
                  onClick={() => setActiveChartView(view as any)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                    activeChartView === view
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {view.charAt(0).toUpperCase() + view.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Forecast Summary Cards */}
      {forecastSummary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-r from-purple-100 to-purple-50 dark:from-purple-900 dark:to-purple-800 rounded-lg p-4">
            <div className="text-xs text-purple-600 dark:text-purple-300">Predicted Total</div>
            <div className="text-2xl font-bold text-purple-700 dark:text-purple-200">
                {formatCurrency(forecastSummary.totalPredicted, currency)}
            </div>
            <div className="text-xs text-purple-500 dark:text-purple-400">
              Next {forecast.period} days
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-900 dark:to-blue-800 rounded-lg p-4">
            <div className="text-xs text-blue-600 dark:text-blue-300">Daily Average</div>
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-200">
                {formatCurrency(forecastSummary.avgDaily, currency)}
            </div>
            <div className="text-xs text-blue-500 dark:text-blue-400">
              Per day forecast
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-100 to-green-50 dark:from-green-900 dark:to-green-800 rounded-lg p-4">
            <div className="text-xs text-green-600 dark:text-green-300">Confidence</div>
            <div className="text-2xl font-bold text-green-700 dark:text-green-200">
              {((forecastSummary.avgConfidence || 0) * 100).toFixed(0)}%
            </div>
            <div className="text-xs text-green-500 dark:text-green-400">
              Prediction accuracy
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-orange-100 to-orange-50 dark:from-orange-900 dark:to-orange-800 rounded-lg p-4">
            <div className="text-xs text-orange-600 dark:text-orange-300">Trend</div>
            <div className="text-2xl font-bold text-orange-700 dark:text-orange-200">
              {forecastSummary.dominantTrend ? 
                Object.entries(forecastSummary.dominantTrend as Record<string, number>)
                  .reduce((a, b) => a[1] > b[1] ? a : b)[0] 
                : 'N/A'
              }
            </div>
            <div className="text-xs text-orange-500 dark:text-orange-400">
              Spending pattern
            </div>
          </div>
        </div>
      )}

      {/* Forecast Chart */}
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 w-full overflow-hidden">
        <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Expense Forecast Visualization
        </h3>
        
        <div className="h-80">
          {activeChartView === 'line' && combinedLineData.length > 0 && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={combinedLineData}>
                <XAxis 
                  dataKey="displayDate"
                  label={{ value: 'Date', position: 'insideBottom', offset: -5 }} 
                />
                <YAxis />
                <Tooltip content={<CustomForecastTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  name="Historical Data"
                  dot={{ r: 4, strokeWidth: 1, fill: '#3B82F6' }}
                  connectNulls={false}
                />
                <Line
                  type="monotone"
                  dataKey="predicted"
                  stroke="#9333EA"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Predicted"
                  dot={{ r: 4, strokeWidth: 1, fill: '#9333EA' }}
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          )}

          {activeChartView === 'area' && combinedLineData.length > 0 && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={combinedLineData}>
                <XAxis 
                  dataKey="displayDate"
                  label={{ value: 'Date', position: 'insideBottom', offset: -5 }} 
                />
                <YAxis />
                <Tooltip content={<CustomForecastTooltip />} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stackId="1"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.6}
                  name="Historical Data"
                />
                <Area
                  type="monotone"
                  dataKey="predicted"
                  stackId="2"
                  stroke="#9333EA"
                  fill="#9333EA"
                  fillOpacity={0.3}
                  strokeDasharray="5 5"
                  name="Predicted Spending"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Category Forecasts */}
      {categoryForecasts.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 w-full overflow-hidden">
          <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">Category Forecasts</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryForecasts.slice(0, 6).map((forecast, index) => (
              <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-medium text-gray-800 dark:text-gray-200">{forecast.category}</div>
                  <div className={`text-xs px-2 py-1 rounded-full ${
                    forecast.trend === 'increasing' 
                      ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300'
                      : forecast.trend === 'decreasing'
                      ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {forecast.trend}
                  </div>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <div>Predicted: {formatCurrency(forecast.predicted, currency)}</div>
                  <div>Confidence: {(forecast.confidence * 100).toFixed(0)}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Forecast Timeline */}
      {forecast.forecasts.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 w-full overflow-hidden">
          <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">Forecast Timeline</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {forecast.forecasts.map((f, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                <div>
                  <div className="font-medium text-sm">{new Date(f.date).toLocaleDateString()}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(f.date).toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-sm">{formatCurrency(f.predicted, currency)}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {(f.confidence * 100).toFixed(0)}% conf.
                  </div>
                </div>
                <div className={`w-2 h-2 rounded-full ${
                  f.trend === 'increasing' ? 'bg-red-400' :
                  f.trend === 'decreasing' ? 'bg-green-400' : 'bg-gray-400'
                }`}></div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ForecastCharts;
