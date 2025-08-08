# Daily Expenses API Documentation

## Overview
The Daily Expenses API provides detailed analytics and insights for expense tracking on a daily basis, including hourly breakdowns, time-of-day analysis, and daily budget tracking.

## Endpoint

### GET `/api/expenses/daily-details`

Retrieves detailed daily expense information for a specific date.

#### Parameters
- `date` (optional, string): Date in YYYY-MM-DD format. If not provided, defaults to current date.

#### Headers
- `Authorization: Bearer <JWT_TOKEN>` (required)

#### Request Example
```bash
curl -X GET "http://localhost:8080/api/expenses/daily-details?date=2024-12-25" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### Response Example
```json
{
  "totalAmount": 1250.75,
  "avgHourly": 52.11,
  "maxHourly": 250.50,
  "minHourly": 0.0,
  "transactionCount": 8,
  "categoryBreakdown": [
    {
      "name": "Food",
      "value": 450.25,
      "percentage": 36
    },
    {
      "name": "Transportation",
      "value": 300.00,
      "percentage": 24
    },
    {
      "name": "Shopping",
      "value": 250.50,
      "percentage": 20
    }
  ],
  "hourlyExpenses": [
    {
      "hour": 0,
      "amount": 0.0
    },
    {
      "hour": 8,
      "amount": 25.50
    },
    {
      "hour": 12,
      "amount": 450.25
    },
    {
      "hour": 18,
      "amount": 300.00
    }
  ],
  "previousDayTotal": 980.30,
  "percentChange": 27.59,
  "date": "2024-12-25",
  "dayName": "WEDNESDAY",
  "dailyBudget": 100.00,
  "budgetUsed": 1250.75,
  "budgetRemaining": -1150.75,
  "topExpenseCategory": "Food",
  "expensesByTimeOfDay": {
    "morning": 125.75,
    "afternoon": 650.25,
    "evening": 400.00,
    "night": 74.75
  }
}
```

#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `totalAmount` | number | Total expenses for the day |
| `avgHourly` | number | Average expense per hour |
| `maxHourly` | number | Highest expense in a single hour |
| `minHourly` | number | Lowest expense in a single hour |
| `transactionCount` | number | Total number of expense transactions |
| `categoryBreakdown` | array | Top 5 expense categories with amounts and percentages |
| `hourlyExpenses` | array | Expenses broken down by hour (0-23) |
| `previousDayTotal` | number | Total expenses from the previous day |
| `percentChange` | number | Percentage change compared to previous day |
| `date` | string | The requested date |
| `dayName` | string | Day of the week |
| `dailyBudget` | number | Daily budget (monthly budget / 30) |
| `budgetUsed` | number | Percentage of daily budget used |
| `budgetRemaining` | number | Remaining daily budget |
| `topExpenseCategory` | string | Category with highest spending |
| `expensesByTimeOfDay` | object | Expenses grouped by time periods |

#### Time of Day Breakdown

- **Morning**: 6:00 AM - 11:59 AM
- **Afternoon**: 12:00 PM - 5:59 PM  
- **Evening**: 6:00 PM - 9:59 PM
- **Night**: 10:00 PM - 5:59 AM

#### Error Responses

##### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Invalid or missing JWT token"
}
```

##### 400 Bad Request
```json
{
  "error": "Bad Request",
  "message": "Invalid date format. Use YYYY-MM-DD"
}
```

##### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "Error fetching daily expenses detail: [specific error message]"
}
```

## Database Schema Changes

### New Column: `created_at`
A new `created_at` timestamp column has been added to the `expenses` table to enable hourly tracking:

```sql
ALTER TABLE expenses 
ADD COLUMN created_at TIMESTAMP;
```

### Indexes for Performance
```sql
CREATE INDEX idx_expenses_created_at ON expenses(created_at);
CREATE INDEX idx_expenses_date_created_by ON expenses(date, created_by);
CREATE INDEX idx_expenses_created_by_created_at ON expenses(created_by, created_at);
```

## Frontend Integration

### Redux Action
```typescript
dispatch(fetchDailyDetailsStart({ date: '2024-12-25' }));
```

### API Call
```typescript
const response = await api.get(`/api/expenses/daily-details?date=${date}`);
```

## Key Features

1. **Hourly Analysis**: Track expenses by hour for detailed daily patterns
2. **Time-based Insights**: Understand spending patterns across different times of day
3. **Budget Tracking**: Monitor daily budget usage and remaining amounts
4. **Category Analysis**: Identify top spending categories for the day
5. **Day Comparison**: Compare current day with previous day spending
6. **Smart Fallbacks**: Handle cases where timestamp data is missing
7. **Performance Optimized**: Efficient queries with proper indexing

## Usage Scenarios

- **Daily Budget Monitoring**: Track if you're staying within daily spending limits
- **Spending Pattern Analysis**: Identify when you spend the most during the day
- **Category Insights**: Understand which categories dominate your daily expenses
- **Behavioral Analysis**: Analyze spending habits across different times of day
- **Budget Planning**: Use historical daily data for better budget planning

## Notes

- For existing expenses without `created_at` timestamps, the system falls back to distributing expenses across business hours (9 AM - 6 PM)
- Daily budget is calculated as monthly budget divided by 30
- All monetary values are rounded to 2 decimal places
- The API only considers transactions with type "EXPENSE" for analysis
- Time zone handling follows server's local time zone
