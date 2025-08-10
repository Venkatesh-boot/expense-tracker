# Custom Date Range API Documentation

## Overview
The Custom Date Range API provides detailed expense analysis for user-defined date ranges, offering comprehensive insights into spending patterns, categorization, and financial trends within any specified period.

## Endpoint
```
GET /api/expenses/custom-range-details
```

## Authentication
- Requires valid JWT token in Authorization header
- User email is extracted from token for data filtering

## Request Parameters

| Parameter | Type | Required | Description | Format |
|-----------|------|----------|-------------|---------|
| startDate | String | Yes | Range start date | YYYY-MM-DD |
| endDate | String | Yes | Range end date | YYYY-MM-DD |

### Example Request
```
GET /api/expenses/custom-range-details?startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <jwt_token>
```

## Response Structure

### Success Response (200 OK)
```json
{
  "totalAmount": 15500.75,
  "totalExpenses": 15500.75,
  "totalIncome": 45000.00,
  "totalSavings": 8000.00,
  "netIncome": 21499.25,
  "avgDaily": 500.02,
  "maxDaily": 1200.50,
  "minDaily": 45.00,
  "transactionCount": 45,
  "incomeTransactionCount": 8,
  "savingsTransactionCount": 5,
  "categoryBreakdown": [
    {
      "name": "Food & Dining",
      "value": 5200.00,
      "percentage": 34
    },
    {
      "name": "Transportation",
      "value": 3800.25,
      "percentage": 25
    }
  ],
  "dailyExpenses": [
    {
      "date": "2024-01-01",
      "amount": 450.00,
      "dayName": "MONDAY"
    },
    {
      "date": "2024-01-02",
      "amount": 320.75,
      "dayName": "TUESDAY"
    }
  ],
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "dayCount": 31,
  "topExpenseDay": {
    "date": "2024-01-15",
    "amount": 1200.50,
    "dayName": "MONDAY"
  },
  "lowestExpenseDay": {
    "date": "2024-01-28",
    "amount": 45.00,
    "dayName": "SUNDAY"
  },
  "mostActiveCategory": "Food & Dining",
  "averagePerCategory": [
    {
      "category": "Food & Dining",
      "avgAmount": 173.33,
      "totalAmount": 5200.00,
      "transactionCount": 30
    },
    {
      "category": "Transportation",
      "avgAmount": 253.35,
      "totalAmount": 3800.25,
      "transactionCount": 15
    }
  ]
}
```

## Response Fields

### Financial Summary
- **totalAmount**: Total expense amount (backward compatibility)
- **totalExpenses**: Sum of all expense transactions
- **totalIncome**: Sum of all income transactions
- **totalSavings**: Sum of all savings transactions
- **netIncome**: Income minus expenses minus savings

### Statistics
- **avgDaily**: Average daily expense amount
- **maxDaily**: Highest single-day expense amount
- **minDaily**: Lowest single-day expense amount (excluding zero days)
- **dayCount**: Number of days in the selected range

### Transaction Counts
- **transactionCount**: Total number of expense transactions
- **incomeTransactionCount**: Number of income transactions
- **savingsTransactionCount**: Number of savings transactions

### Category Analysis
- **categoryBreakdown**: Top 5 expense categories with amounts and percentages
- **mostActiveCategory**: Category with highest total spending
- **averagePerCategory**: Detailed per-category statistics including average transaction amount

### Daily Breakdown
- **dailyExpenses**: Day-by-day expense amounts for chart visualization
- **topExpenseDay**: Date with highest expenses
- **lowestExpenseDay**: Date with lowest expenses (excluding zero-expense days)

### Date Range Info
- **startDate**: Requested start date
- **endDate**: Requested end date

## Error Responses

### 400 Bad Request
```json
{
  "error": "Start date cannot be after end date"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized: Invalid or missing token"
}
```

### 500 Internal Server Error
```json
{
  "error": "Error fetching custom range expenses detail: [error details]"
}
```

## Usage Examples

### Last 7 Days Analysis
```
GET /api/expenses/custom-range-details?startDate=2024-08-03&endDate=2024-08-10
```

### Monthly Analysis
```
GET /api/expenses/custom-range-details?startDate=2024-07-01&endDate=2024-07-31
```

### Quarterly Analysis
```
GET /api/expenses/custom-range-details?startDate=2024-01-01&endDate=2024-03-31
```

### Year-to-Date Analysis
```
GET /api/expenses/custom-range-details?startDate=2024-01-01&endDate=2024-08-10
```

## Features

### 1. **Flexible Date Range**
- Support for any date range from single day to multiple years
- Automatic validation of start/end date logic

### 2. **Comprehensive Financial Analysis**
- Income, expense, and savings tracking
- Net income calculation
- Daily averages and extremes

### 3. **Category Insights**
- Top spending categories with percentages
- Average transaction amounts per category
- Most active category identification

### 4. **Daily Patterns**
- Day-by-day expense breakdown
- Peak and low spending days
- Complete daily timeline for visualization

### 5. **Chart-Ready Data**
- Pre-formatted data for pie charts (categories)
- Daily expense data for bar/line charts
- Percentage calculations for visual representations

## Integration Notes

### Frontend Integration
- Use with DateRangePicker component for user-friendly date selection
- Data is pre-formatted for Chart.js, Recharts, or similar charting libraries
- Responsive design considerations for mobile date range selection

### Performance Considerations
- Recommended maximum range: 2 years for optimal performance
- Large date ranges may take longer to process
- Consider pagination for very large datasets

### Caching Strategy
- Results can be cached based on user + date range combination
- Cache invalidation needed when new transactions are added within the range
- Consider implementing client-side caching for frequently accessed ranges

## Related Endpoints
- `GET /api/expenses/daily-details` - Single day analysis
- `GET /api/expenses/monthly-details` - Single month analysis  
- `GET /api/expenses/yearly-details` - Single year analysis
- `GET /api/expenses/summary` - Overall user summary

This endpoint provides the most flexible expense analysis capability, allowing users to analyze their spending patterns for any custom time period with comprehensive insights and chart-ready data.
