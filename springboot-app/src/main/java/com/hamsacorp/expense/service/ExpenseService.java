package com.hamsacorp.expense.service;

import com.hamsacorp.expense.model.Expense;
import com.hamsacorp.expense.repository.ExpenseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class ExpenseService {
    @Autowired
    private ExpenseRepository expenseRepository;
    
    @Autowired
    private UserSettingsService userSettingsService;

    public Expense saveExpense(Expense expense) {
        return expenseRepository.save(expense);
    }

    public List<Expense> getAllExpenses() {
        return expenseRepository.findAllByOrderByDateDesc();
    }

    public Page<Expense> getAllExpenses(Pageable pageable) {
        return expenseRepository.findAllByOrderByDateDesc(pageable);
    }

    public Optional<Expense> getExpenseById(Long id) {
        return expenseRepository.findById(id);
    }

    public void deleteExpense(Long id) {
        expenseRepository.deleteById(id);
    }

    public List<Expense> getExpensesByDateRange(String from, String to) {
        LocalDate fromDate = LocalDate.parse(from);
        LocalDate toDate = LocalDate.parse(to);
        return expenseRepository.findAllByDateBetweenOrderByDateDesc(fromDate, toDate);
    }

    public Page<Expense> getExpensesByDateRange(String from, String to, Pageable pageable) {
        LocalDate fromDate = LocalDate.parse(from);
        LocalDate toDate = LocalDate.parse(to);
        return expenseRepository.findAllByDateBetweenOrderByDateDesc(fromDate, toDate, pageable);
    }

    public Page<Expense> getAllExpensesByCreatedBy(String createdBy, Pageable pageable) {
        return expenseRepository.findAllByCreatedByOrderByDateDesc(createdBy, pageable);
    }

    public List<Expense> getExpensesByDateRangeAndCreatedBy(String from, String to, String createdBy) {
        LocalDate fromDate = LocalDate.parse(from);
        LocalDate toDate = LocalDate.parse(to);
        return expenseRepository.findAllByDateBetweenAndCreatedByOrderByDateDesc(fromDate, toDate, createdBy);
    }

    public java.util.Map<String, Object> getSummaryForUser(String email) {
        java.time.LocalDate now = java.time.LocalDate.now();
        java.time.YearMonth currentMonth = java.time.YearMonth.from(now);
        java.time.Year currentYear = java.time.Year.from(now);
        // Fetch all expenses for this user
        var allExpenses = expenseRepository.findAllByCreatedByOrderByDateDesc(email, org.springframework.data.domain.Pageable.unpaged()).getContent();
        double monthlyExpenses = allExpenses.stream()
            .filter(e -> e.getType() == Expense.ExpenseType.EXPENSE &&
                         java.time.YearMonth.from(e.getDate()).equals(currentMonth))
            .mapToDouble(Expense::getAmount).sum();
        double yearlyExpenses = allExpenses.stream()
            .filter(e -> e.getType() == Expense.ExpenseType.EXPENSE &&
                         java.time.Year.from(e.getDate()).equals(currentYear))
            .mapToDouble(Expense::getAmount).sum();
        double monthlyIncome = allExpenses.stream()
            .filter(e -> e.getType() == Expense.ExpenseType.INCOME &&
                         java.time.YearMonth.from(e.getDate()).equals(currentMonth))
            .mapToDouble(Expense::getAmount).sum();
        double monthlySavings = allExpenses.stream()
            .filter(e -> e.getType() == Expense.ExpenseType.SAVINGS &&
                         java.time.YearMonth.from(e.getDate()).equals(currentMonth))
            .mapToDouble(Expense::getAmount).sum();
        java.util.Map<String, Object> summary = new java.util.HashMap<>();
        summary.put("monthlyExpenses", monthlyExpenses);
        summary.put("yearlyExpenses", yearlyExpenses);
        summary.put("monthlyIncome", monthlyIncome);
        summary.put("monthlySavings", monthlySavings);
        return summary;
    }

    public java.util.Map<String, Object> getMonthlyExpensesDetail(String email, int year, int month) {
        java.time.YearMonth targetMonth = java.time.YearMonth.of(year, month);
        java.time.LocalDate startOfMonth = targetMonth.atDay(1);
        java.time.LocalDate endOfMonth = targetMonth.atEndOfMonth();
        
        // Fetch all transactions for the specified month
        var monthlyTransactions = expenseRepository.findAllByCreatedByAndDateBetweenOrderByDateDesc(email, startOfMonth, endOfMonth);
        
        // Filter transactions by type
        var expenseTransactions = monthlyTransactions.stream()
            .filter(e -> e.getType() == Expense.ExpenseType.EXPENSE)
            .collect(java.util.stream.Collectors.toList());
        
        var incomeTransactions = monthlyTransactions.stream()
            .filter(e -> e.getType() == Expense.ExpenseType.INCOME)
            .collect(java.util.stream.Collectors.toList());
        
        var savingsTransactions = monthlyTransactions.stream()
            .filter(e -> e.getType() == Expense.ExpenseType.SAVINGS)
            .collect(java.util.stream.Collectors.toList());
        
        // Calculate totals for each type
        double totalExpenses = expenseTransactions.stream().mapToDouble(Expense::getAmount).sum();
        double totalIncome = incomeTransactions.stream().mapToDouble(Expense::getAmount).sum();
        double totalSavings = savingsTransactions.stream().mapToDouble(Expense::getAmount).sum();
        double netIncome = totalIncome - totalExpenses - totalSavings;
        
        // Calculate total amount (expenses only for backward compatibility)
        double totalAmount = totalExpenses;
        
        // Group by category
        java.util.Map<String, Double> categoryBreakdown = expenseTransactions.stream()
            .collect(java.util.stream.Collectors.groupingBy(
                Expense::getCategory,
                java.util.stream.Collectors.summingDouble(Expense::getAmount)
            ));
        
        // Group by day for daily expenses
        java.util.Map<Integer, Double> dailyExpenses = expenseTransactions.stream()
            .collect(java.util.stream.Collectors.groupingBy(
                e -> e.getDate().getDayOfMonth(),
                java.util.stream.Collectors.summingDouble(Expense::getAmount)
            ));
        
        // Calculate statistics
        double avgDaily = totalAmount / endOfMonth.getDayOfMonth();
        
        java.util.OptionalDouble maxDailyOpt = dailyExpenses.values().stream().mapToDouble(Double::doubleValue).max();
        java.util.OptionalDouble minDailyOpt = dailyExpenses.values().stream().mapToDouble(Double::doubleValue).min();
        
        // Get previous month data for comparison
        java.time.YearMonth previousMonth = targetMonth.minusMonths(1);
        java.time.LocalDate prevStartOfMonth = previousMonth.atDay(1);
        java.time.LocalDate prevEndOfMonth = previousMonth.atEndOfMonth();
        
        var previousMonthTransactions = expenseRepository.findAllByCreatedByAndDateBetweenOrderByDateDesc(email, prevStartOfMonth, prevEndOfMonth);
        double previousMonthExpenses = previousMonthTransactions.stream()
            .filter(e -> e.getType() == Expense.ExpenseType.EXPENSE)
            .mapToDouble(Expense::getAmount).sum();
        double previousMonthIncome = previousMonthTransactions.stream()
            .filter(e -> e.getType() == Expense.ExpenseType.INCOME)
            .mapToDouble(Expense::getAmount).sum();
        double previousMonthSavings = previousMonthTransactions.stream()
            .filter(e -> e.getType() == Expense.ExpenseType.SAVINGS)
            .mapToDouble(Expense::getAmount).sum();
        
        // Calculate percentage changes
        double expensePercentChange = previousMonthExpenses > 0 ? ((totalExpenses - previousMonthExpenses) / previousMonthExpenses) * 100 : 0;
        double incomePercentChange = previousMonthIncome > 0 ? ((totalIncome - previousMonthIncome) / previousMonthIncome) * 100 : 0;
        double savingsPercentChange = previousMonthSavings > 0 ? ((totalSavings - previousMonthSavings) / previousMonthSavings) * 100 : 0;
        
        // Calculate savings rate
        double savingsRate = totalIncome > 0 ? (totalSavings / totalIncome) * 100 : 0;
        
        // Get top categories (limit to top 5)
        java.util.List<java.util.Map<String, Object>> topCategories = categoryBreakdown.entrySet().stream()
            .sorted(java.util.Map.Entry.<String, Double>comparingByValue().reversed())
            .limit(5)
            .map(entry -> {
                java.util.Map<String, Object> categoryMap = new java.util.HashMap<>();
                categoryMap.put("name", entry.getKey());
                categoryMap.put("value", entry.getValue());
                categoryMap.put("percentage", Math.round((entry.getValue() / totalAmount) * 100));
                return categoryMap;
            })
            .collect(java.util.stream.Collectors.toList());
        
        // Convert daily expenses to list format for charts
        java.util.List<java.util.Map<String, Object>> dailyData = new java.util.ArrayList<>();
        for (int day = 1; day <= endOfMonth.getDayOfMonth(); day++) {
            java.util.Map<String, Object> dayData = new java.util.HashMap<>();
            dayData.put("day", day);
            dayData.put("amount", dailyExpenses.getOrDefault(day, 0.0));
            dailyData.add(dayData);
        }
        
        // Get user's monthly budget from settings
        var userSettings = userSettingsService.getUserSettings(email);
        double monthlyBudget = userSettings.getMonthlyBudget();
        double budgetUsed = (monthlyBudget > 0) ? (totalAmount / monthlyBudget) * 100 : 0;
        double budgetRemaining = Math.max(0, monthlyBudget - totalAmount);
        
        // Get recurring expenses for this user
        var recurringExpenses = getRecurringExpensesForUser(email);
        
        // Build response
        java.util.Map<String, Object> result = new java.util.HashMap<>();
        result.put("totalAmount", totalAmount);
        result.put("totalExpenses", totalExpenses);
        result.put("totalIncome", totalIncome);
        result.put("totalSavings", totalSavings);
        result.put("netIncome", netIncome);
        result.put("savingsRate", Math.round(savingsRate * 100.0) / 100.0);
        result.put("avgDaily", Math.round(avgDaily * 100.0) / 100.0);
        result.put("maxDaily", maxDailyOpt.orElse(0.0));
        result.put("minDaily", minDailyOpt.orElse(0.0));
        result.put("transactionCount", expenseTransactions.size());
        result.put("incomeTransactionCount", incomeTransactions.size());
        result.put("savingsTransactionCount", savingsTransactions.size());
        result.put("categoryBreakdown", topCategories);
        result.put("dailyExpenses", dailyData);
        result.put("previousMonthExpenses", previousMonthExpenses);
        result.put("previousMonthIncome", previousMonthIncome);
        result.put("previousMonthSavings", previousMonthSavings);
        result.put("expensePercentChange", Math.round(expensePercentChange * 100.0) / 100.0);
        result.put("incomePercentChange", Math.round(incomePercentChange * 100.0) / 100.0);
        result.put("savingsPercentChange", Math.round(savingsPercentChange * 100.0) / 100.0);
        result.put("year", year);
        result.put("month", month);
        result.put("monthName", targetMonth.getMonth().toString());
        result.put("monthlyBudget", monthlyBudget);
        result.put("budgetUsed", Math.round(budgetUsed * 100.0) / 100.0);
        result.put("budgetRemaining", budgetRemaining);
        result.put("recurringExpenses", recurringExpenses);
        
        return result;
    }

    public java.util.Map<String, Object> getYearlyExpensesDetail(String email, int year) {
        java.time.Year targetYear = java.time.Year.of(year);
        java.time.LocalDate startOfYear = targetYear.atDay(1);
        java.time.LocalDate endOfYear = targetYear.atDay(targetYear.length());
        
        // Fetch all transactions for the specified year
        var yearlyTransactions = expenseRepository.findAllByCreatedByAndDateBetweenOrderByDateDesc(email, startOfYear, endOfYear);
        
        // Filter transactions by type
        var expenseTransactions = yearlyTransactions.stream()
            .filter(e -> e.getType() == Expense.ExpenseType.EXPENSE)
            .collect(java.util.stream.Collectors.toList());
        
        var incomeTransactions = yearlyTransactions.stream()
            .filter(e -> e.getType() == Expense.ExpenseType.INCOME)
            .collect(java.util.stream.Collectors.toList());
        
        var savingsTransactions = yearlyTransactions.stream()
            .filter(e -> e.getType() == Expense.ExpenseType.SAVINGS)
            .collect(java.util.stream.Collectors.toList());
        
        // Calculate totals for each type
        double totalExpenses = expenseTransactions.stream().mapToDouble(Expense::getAmount).sum();
        double totalIncome = incomeTransactions.stream().mapToDouble(Expense::getAmount).sum();
        double totalSavings = savingsTransactions.stream().mapToDouble(Expense::getAmount).sum();
        double netIncome = totalIncome - totalExpenses - totalSavings;
        
        // Calculate total amount (expenses only for backward compatibility)
        double totalAmount = totalExpenses;
        
        // Group by category
        java.util.Map<String, Double> categoryBreakdown = expenseTransactions.stream()
            .collect(java.util.stream.Collectors.groupingBy(
                Expense::getCategory,
                java.util.stream.Collectors.summingDouble(Expense::getAmount)
            ));
        
        // Group by month for monthly expenses
        java.util.Map<Integer, Double> monthlyExpenses = expenseTransactions.stream()
            .collect(java.util.stream.Collectors.groupingBy(
                e -> e.getDate().getMonthValue(),
                java.util.stream.Collectors.summingDouble(Expense::getAmount)
            ));
        
        // Calculate statistics
        double avgMonthly = totalAmount / 12;
        
        java.util.OptionalDouble maxMonthlyOpt = monthlyExpenses.values().stream().mapToDouble(Double::doubleValue).max();
        java.util.OptionalDouble minMonthlyOpt = monthlyExpenses.values().stream().mapToDouble(Double::doubleValue).min();
        
        // Get previous year data for comparison
        java.time.Year previousYear = targetYear.minusYears(1);
        java.time.LocalDate prevStartOfYear = previousYear.atDay(1);
        java.time.LocalDate prevEndOfYear = previousYear.atDay(previousYear.length());
        
        var previousYearTransactions = expenseRepository.findAllByCreatedByAndDateBetweenOrderByDateDesc(email, prevStartOfYear, prevEndOfYear);
        double previousYearExpenses = previousYearTransactions.stream()
            .filter(e -> e.getType() == Expense.ExpenseType.EXPENSE)
            .mapToDouble(Expense::getAmount).sum();
        double previousYearIncome = previousYearTransactions.stream()
            .filter(e -> e.getType() == Expense.ExpenseType.INCOME)
            .mapToDouble(Expense::getAmount).sum();
        double previousYearSavings = previousYearTransactions.stream()
            .filter(e -> e.getType() == Expense.ExpenseType.SAVINGS)
            .mapToDouble(Expense::getAmount).sum();
        
        // Calculate percentage changes
        double expensePercentChange = previousYearExpenses > 0 ? ((totalExpenses - previousYearExpenses) / previousYearExpenses) * 100 : 0;
        double incomePercentChange = previousYearIncome > 0 ? ((totalIncome - previousYearIncome) / previousYearIncome) * 100 : 0;
        double savingsPercentChange = previousYearSavings > 0 ? ((totalSavings - previousYearSavings) / previousYearSavings) * 100 : 0;
        
        // Calculate savings rate
        double savingsRate = totalIncome > 0 ? (totalSavings / totalIncome) * 100 : 0;
        
        // Get top categories (limit to top 5)
        java.util.List<java.util.Map<String, Object>> topCategories = categoryBreakdown.entrySet().stream()
            .sorted(java.util.Map.Entry.<String, Double>comparingByValue().reversed())
            .limit(5)
            .map(entry -> {
                java.util.Map<String, Object> categoryMap = new java.util.HashMap<>();
                categoryMap.put("name", entry.getKey());
                categoryMap.put("value", entry.getValue());
                categoryMap.put("percentage", Math.round((entry.getValue() / totalAmount) * 100));
                return categoryMap;
            })
            .collect(java.util.stream.Collectors.toList());
        
        // Convert monthly expenses to list format for charts
        java.util.List<java.util.Map<String, Object>> monthlyData = new java.util.ArrayList<>();
        String[] monthNames = {"Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                              "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"};
        
        for (int month = 1; month <= 12; month++) {
            java.util.Map<String, Object> monthData = new java.util.HashMap<>();
            monthData.put("month", monthNames[month - 1]);
            monthData.put("monthNumber", month);
            monthData.put("amount", monthlyExpenses.getOrDefault(month, 0.0));
            monthlyData.add(monthData);
        }
        
        // Find highest and lowest months
        java.util.Map<String, Object> highestMonth = monthlyData.stream()
            .max((m1, m2) -> Double.compare((Double)m1.get("amount"), (Double)m2.get("amount")))
            .orElse(null);
        
        java.util.Map<String, Object> lowestMonth = monthlyData.stream()
            .min((m1, m2) -> Double.compare((Double)m1.get("amount"), (Double)m2.get("amount")))
            .orElse(null);
        
        // Get user's yearly budget from settings (monthly budget * 12)
        var userSettings = userSettingsService.getUserSettings(email);
        double monthlyBudget = userSettings.getMonthlyBudget();
        double yearlyBudget = monthlyBudget * 12;
        double budgetUsed = (yearlyBudget > 0) ? (totalAmount / yearlyBudget) * 100 : 0;
        double budgetRemaining = Math.max(0, yearlyBudget - totalAmount);
        
        // Get recurring expenses for this user
        var recurringExpenses = getRecurringExpensesForUser(email);
        
        // Build response
        java.util.Map<String, Object> result = new java.util.HashMap<>();
        result.put("totalAmount", totalAmount);
        result.put("totalExpenses", totalExpenses);
        result.put("totalIncome", totalIncome);
        result.put("totalSavings", totalSavings);
        result.put("netIncome", netIncome);
        result.put("savingsRate", Math.round(savingsRate * 100.0) / 100.0);
        result.put("avgMonthly", Math.round(avgMonthly * 100.0) / 100.0);
        result.put("maxMonthly", maxMonthlyOpt.orElse(0.0));
        result.put("minMonthly", minMonthlyOpt.orElse(0.0));
        result.put("transactionCount", expenseTransactions.size());
        result.put("incomeTransactionCount", incomeTransactions.size());
        result.put("savingsTransactionCount", savingsTransactions.size());
        result.put("categoryBreakdown", topCategories);
        result.put("monthlyExpenses", monthlyData);
        result.put("previousYearExpenses", previousYearExpenses);
        result.put("previousYearIncome", previousYearIncome);
        result.put("previousYearSavings", previousYearSavings);
        result.put("expensePercentChange", Math.round(expensePercentChange * 100.0) / 100.0);
        result.put("incomePercentChange", Math.round(incomePercentChange * 100.0) / 100.0);
        result.put("savingsPercentChange", Math.round(savingsPercentChange * 100.0) / 100.0);
        result.put("year", year);
        result.put("highestMonth", highestMonth);
        result.put("lowestMonth", lowestMonth);
        result.put("yearlyBudget", yearlyBudget);
        result.put("budgetUsed", Math.round(budgetUsed * 100.0) / 100.0);
        result.put("budgetRemaining", budgetRemaining);
        result.put("recurringExpenses", recurringExpenses);
        
        return result;
    }

    public java.util.List<java.util.Map<String, Object>> getRecurringExpensesForUser(String email) {
        try {
            // Get expenses from the last 6 months to analyze patterns
            java.time.LocalDate endDate = java.time.LocalDate.now();
            java.time.LocalDate startDate = endDate.minusMonths(6);
            
            // Fetch and filter expense transactions
            List<Expense> expenseTransactions = expenseRepository
                .findAllByCreatedByAndDateBetweenOrderByDateDesc(email, startDate, endDate)
                .stream()
                .filter(e -> e.getType() == Expense.ExpenseType.EXPENSE)
                .collect(java.util.stream.Collectors.toList());
            
            if (expenseTransactions.isEmpty()) {
                return new java.util.ArrayList<>();
            }
            
            // Group by normalized description and category to find recurring patterns
            java.util.Map<String, java.util.List<Expense>> groupedExpenses = expenseTransactions.stream()
                .collect(java.util.stream.Collectors.groupingBy(this::createExpenseKey));
            
            return groupedExpenses.entrySet().stream()
                .filter(entry -> isRecurringPattern(entry.getValue()))
                .map(entry -> createRecurringExpenseResponse(entry))
                .sorted((a, b) -> Double.compare((Double) b.get("amount"), (Double) a.get("amount")))
                .collect(java.util.stream.Collectors.toList());
                
        } catch (Exception e) {
            // Log error and return empty list instead of throwing
            System.err.println("Error analyzing recurring expenses for user " + email + ": " + e.getMessage());
            return new java.util.ArrayList<>();
        }
    }
    
    private String createExpenseKey(Expense expense) {
        return normalizeDescription(expense.getDescription()) + "|" + expense.getCategory();
    }
    
    private String normalizeDescription(String description) {
        if (description == null) return "";
        return description.toLowerCase().trim().replaceAll("\\s+", " ");
    }
    
    private boolean isRecurringPattern(java.util.List<Expense> expenses) {
        // Consider it recurring if it appears at least 3 times in 6 months
        // and amounts are relatively consistent (within 20% variance)
        if (expenses.size() < 3) return false;
        
        double avgAmount = expenses.stream().mapToDouble(Expense::getAmount).average().orElse(0.0);
        double variance = expenses.stream()
            .mapToDouble(e -> Math.abs(e.getAmount() - avgAmount) / avgAmount)
            .average()
            .orElse(0.0);
            
        return variance <= 0.2; // Allow 20% variance in amount
    }
    
    private java.util.Map<String, Object> createRecurringExpenseResponse(java.util.Map.Entry<String, java.util.List<Expense>> entry) {
        java.util.List<Expense> expenses = entry.getValue();
        Expense latestExpense = expenses.get(0); // Already sorted by date desc
        
        double avgAmount = expenses.stream()
            .mapToDouble(Expense::getAmount)
            .average()
            .orElse(0.0);
        
        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("name", latestExpense.getDescription());
        response.put("description", latestExpense.getDescription());
        response.put("category", latestExpense.getCategory());
        response.put("amount", Math.round(avgAmount * 100.0) / 100.0);
        response.put("frequency", calculateFrequency(expenses));
        response.put("lastDate", latestExpense.getDate());
        response.put("transactionCount", expenses.size());
        response.put("variance", Math.round(calculateAmountVariance(expenses, avgAmount) * 100.0) / 100.0);
        
        return response;
    }
    
    private double calculateAmountVariance(java.util.List<Expense> expenses, double avgAmount) {
        if (expenses.isEmpty() || avgAmount == 0) return 0.0;
        
        return expenses.stream()
            .mapToDouble(e -> Math.abs(e.getAmount() - avgAmount) / avgAmount)
            .average()
            .orElse(0.0);
    }
    
    private String calculateFrequency(java.util.List<Expense> expenses) {
        if (expenses.size() < 2) return "monthly";
        
        // Sort by date to calculate intervals
        java.util.List<Expense> sortedExpenses = expenses.stream()
            .sorted((a, b) -> a.getDate().compareTo(b.getDate()))
            .collect(java.util.stream.Collectors.toList());
            
        // Calculate average days between transactions
        long totalDays = 0;
        int intervals = 0;
        
        for (int i = 1; i < sortedExpenses.size(); i++) {
            long daysBetween = java.time.temporal.ChronoUnit.DAYS.between(
                sortedExpenses.get(i - 1).getDate(),
                sortedExpenses.get(i).getDate()
            );
            if (daysBetween > 0) { // Avoid same-day duplicates
                totalDays += daysBetween;
                intervals++;
            }
        }
        
        if (intervals == 0) return "monthly";
        
        double avgDaysBetween = (double) totalDays / intervals;
        
        // Classify frequency based on average interval
        if (avgDaysBetween <= 10) {
            return "weekly";
        } else if (avgDaysBetween <= 45) {
            return "monthly";
        } else if (avgDaysBetween <= 120) {
            return "quarterly";
        } else {
            return "yearly";
        }
    }

    public java.util.Map<String, Object> getDailyExpensesDetail(String email, String dateStr) {
        java.time.LocalDate targetDate = java.time.LocalDate.parse(dateStr);
        
        // Fetch all expenses for the specified date
        var dailyExpenses = expenseRepository.findAllByCreatedByAndDateOrderByIdDesc(email, targetDate);
        
        // Filter only expense type transactions
        var expenseTransactions = dailyExpenses.stream()
            .filter(e -> e.getType() == Expense.ExpenseType.EXPENSE)
            .collect(java.util.stream.Collectors.toList());
        
        // Calculate total amount
        double totalAmount = expenseTransactions.stream()
            .mapToDouble(Expense::getAmount).sum();
        
        // Group by category
        java.util.Map<String, Double> categoryBreakdown = expenseTransactions.stream()
            .collect(java.util.stream.Collectors.groupingBy(
                Expense::getCategory,
                java.util.stream.Collectors.summingDouble(Expense::getAmount)
            ));
        
        // Group by hour for hourly expenses (using createdAt timestamp)
        java.util.Map<Integer, Double> hourlyExpenses = expenseTransactions.stream()
            .filter(e -> e.getCreatedAt() != null)
            .collect(java.util.stream.Collectors.groupingBy(
                e -> e.getCreatedAt().getHour(),
                java.util.stream.Collectors.summingDouble(Expense::getAmount)
            ));
        
        // If no createdAt timestamps, distribute evenly across business hours (9-18)
        if (hourlyExpenses.isEmpty() && !expenseTransactions.isEmpty()) {
            // Fallback: distribute expenses across typical business hours
            int businessHours = 10; // 9 AM to 6 PM
            double avgPerHour = totalAmount / expenseTransactions.size();
            for (int i = 0; i < expenseTransactions.size() && i < businessHours; i++) {
                hourlyExpenses.put(9 + i, avgPerHour);
            }
        }
        
        // Calculate statistics
        double avgHourly = hourlyExpenses.isEmpty() ? 0 : totalAmount / 24; // Average over 24 hours
        
        java.util.OptionalDouble maxHourlyOpt = hourlyExpenses.values().stream().mapToDouble(Double::doubleValue).max();
        java.util.OptionalDouble minHourlyOpt = hourlyExpenses.values().stream().mapToDouble(Double::doubleValue).min();
        
        // Previous day comparison
        java.time.LocalDate previousDay = targetDate.minusDays(1);
        var previousDayExpenses = expenseRepository.findAllByCreatedByAndDateOrderByIdDesc(email, previousDay);
        double previousDayTotal = previousDayExpenses.stream()
            .filter(e -> e.getType() == Expense.ExpenseType.EXPENSE)
            .mapToDouble(Expense::getAmount).sum();
        
        // Calculate percentage change
        double percentChange = previousDayTotal > 0 ? ((totalAmount - previousDayTotal) / previousDayTotal) * 100 : 0;
        
        // Get top categories (limit to top 5)
        java.util.List<java.util.Map<String, Object>> topCategories = categoryBreakdown.entrySet().stream()
            .sorted(java.util.Map.Entry.<String, Double>comparingByValue().reversed())
            .limit(5)
            .map(entry -> {
                java.util.Map<String, Object> categoryMap = new java.util.HashMap<>();
                categoryMap.put("name", entry.getKey());
                categoryMap.put("value", entry.getValue());
                categoryMap.put("percentage", totalAmount > 0 ? Math.round((entry.getValue() / totalAmount) * 100) : 0);
                return categoryMap;
            })
            .collect(java.util.stream.Collectors.toList());
        
        // Convert hourly expenses to list format for charts (0-23 hours)
        java.util.List<java.util.Map<String, Object>> hourlyData = new java.util.ArrayList<>();
        for (int hour = 0; hour < 24; hour++) {
            java.util.Map<String, Object> hourData = new java.util.HashMap<>();
            hourData.put("hour", hour);
            hourData.put("amount", hourlyExpenses.getOrDefault(hour, 0.0));
            hourlyData.add(hourData);
        }
        
        // Calculate expenses by time of day using dynamic ranges
        java.util.Map<String, java.util.List<Integer>> timeRanges = getTimeOfDayRanges();
        java.util.Map<String, Double> expensesByTimeOfDay = new java.util.HashMap<>();
        
        expensesByTimeOfDay.put("morning", hourlyExpenses.entrySet().stream()
            .filter(entry -> isHourInRange(entry.getKey(), timeRanges.get("morning")))
            .mapToDouble(java.util.Map.Entry::getValue).sum());
        expensesByTimeOfDay.put("afternoon", hourlyExpenses.entrySet().stream()
            .filter(entry -> isHourInRange(entry.getKey(), timeRanges.get("afternoon")))
            .mapToDouble(java.util.Map.Entry::getValue).sum());
        expensesByTimeOfDay.put("evening", hourlyExpenses.entrySet().stream()
            .filter(entry -> isHourInRange(entry.getKey(), timeRanges.get("evening")))
            .mapToDouble(java.util.Map.Entry::getValue).sum());
        expensesByTimeOfDay.put("night", hourlyExpenses.entrySet().stream()
            .filter(entry -> isHourInRange(entry.getKey(), timeRanges.get("night")))
            .mapToDouble(java.util.Map.Entry::getValue).sum());
        
        // Get user's daily budget from settings (monthly budget / 30)
        var userSettings = userSettingsService.getUserSettings(email);
        double monthlyBudget = userSettings.getMonthlyBudget();
        double dailyBudget = monthlyBudget / 30.0;
        double budgetUsed = (dailyBudget > 0) ? (totalAmount / dailyBudget) * 100 : 0;
        double budgetRemaining = Math.max(0, dailyBudget - totalAmount);
        
        // Find top expense category
        String topExpenseCategory = topCategories.isEmpty() ? "" : (String) topCategories.get(0).get("name");
        
        // Get day name
        String dayName = targetDate.getDayOfWeek().toString();
        
        // Build response
        java.util.Map<String, Object> result = new java.util.HashMap<>();
        result.put("totalAmount", Math.round(totalAmount * 100.0) / 100.0);
        result.put("avgHourly", Math.round(avgHourly * 100.0) / 100.0);
        result.put("maxHourly", maxHourlyOpt.orElse(0.0));
        result.put("minHourly", minHourlyOpt.orElse(0.0));
        result.put("transactionCount", expenseTransactions.size());
        result.put("categoryBreakdown", topCategories);
        result.put("hourlyExpenses", hourlyData);
        result.put("previousDayTotal", Math.round(previousDayTotal * 100.0) / 100.0);
        result.put("percentChange", Math.round(percentChange * 100.0) / 100.0);
        result.put("date", dateStr);
        result.put("dayName", dayName);
        result.put("dailyBudget", Math.round(dailyBudget * 100.0) / 100.0);
        result.put("budgetUsed", Math.round(budgetUsed * 100.0) / 100.0);
        result.put("budgetRemaining", Math.round(budgetRemaining * 100.0) / 100.0);
        result.put("topExpenseCategory", topExpenseCategory);
        result.put("expensesByTimeOfDay", expensesByTimeOfDay);
        
        return result;
    }
    
    /**
     * Get configurable time ranges for different parts of the day
     * This can be easily modified or made configurable per user in the future
     */
    private java.util.Map<String, java.util.List<Integer>> getTimeOfDayRanges() {
        java.util.Map<String, java.util.List<Integer>> timeRanges = new java.util.HashMap<>();
        
        // Morning: 6 AM to 11:59 AM
        timeRanges.put("morning", java.util.Arrays.asList(6, 7, 8, 9, 10, 11));
        
        // Afternoon: 12 PM to 5:59 PM  
        timeRanges.put("afternoon", java.util.Arrays.asList(12, 13, 14, 15, 16, 17));
        
        // Evening: 6 PM to 9:59 PM
        timeRanges.put("evening", java.util.Arrays.asList(18, 19, 20, 21));
        
        // Night: 10 PM to 5:59 AM (next day)
        timeRanges.put("night", java.util.Arrays.asList(22, 23, 0, 1, 2, 3, 4, 5));
        
        return timeRanges;
    }
    
    /**
     * Check if an hour falls within a given time range
     */
    private boolean isHourInRange(Integer hour, java.util.List<Integer> range) {
        return range != null && range.contains(hour);
    }

    public java.util.Map<String, Object> getCustomRangeExpensesDetail(String email, String startDateStr, String endDateStr) {
        java.time.LocalDate startDate = java.time.LocalDate.parse(startDateStr);
        java.time.LocalDate endDate = java.time.LocalDate.parse(endDateStr);
        
        // Validate date range
        if (startDate.isAfter(endDate)) {
            throw new IllegalArgumentException("Start date cannot be after end date");
        }
        
        // Fetch all transactions for the specified date range
        var rangeTransactions = expenseRepository.findAllByCreatedByAndDateBetweenOrderByDateDesc(email, startDate, endDate);
        
        // Filter transactions by type
        var expenseTransactions = rangeTransactions.stream()
            .filter(e -> e.getType() == Expense.ExpenseType.EXPENSE)
            .collect(java.util.stream.Collectors.toList());
        
        var incomeTransactions = rangeTransactions.stream()
            .filter(e -> e.getType() == Expense.ExpenseType.INCOME)
            .collect(java.util.stream.Collectors.toList());
        
        var savingsTransactions = rangeTransactions.stream()
            .filter(e -> e.getType() == Expense.ExpenseType.SAVINGS)
            .collect(java.util.stream.Collectors.toList());
        
        // Calculate totals for each type
        double totalExpenses = expenseTransactions.stream().mapToDouble(Expense::getAmount).sum();
        double totalIncome = incomeTransactions.stream().mapToDouble(Expense::getAmount).sum();
        double totalSavings = savingsTransactions.stream().mapToDouble(Expense::getAmount).sum();
        double netIncome = totalIncome - totalExpenses - totalSavings;
        
        // Calculate total amount (expenses only for backward compatibility)
        double totalAmount = totalExpenses;
        
        // Calculate day count
        long dayCount = java.time.temporal.ChronoUnit.DAYS.between(startDate, endDate) + 1;
        
        // Group by category
        java.util.Map<String, Double> categoryBreakdown = expenseTransactions.stream()
            .collect(java.util.stream.Collectors.groupingBy(
                Expense::getCategory,
                java.util.stream.Collectors.summingDouble(Expense::getAmount)
            ));
        
        // Group by date for daily expenses
        java.util.Map<java.time.LocalDate, Double> dailyExpensesMap = expenseTransactions.stream()
            .collect(java.util.stream.Collectors.groupingBy(
                Expense::getDate,
                java.util.stream.Collectors.summingDouble(Expense::getAmount)
            ));
        
        // Calculate statistics
        double avgDaily = dayCount > 0 ? totalAmount / dayCount : 0;
        
        java.util.OptionalDouble maxDailyOpt = dailyExpensesMap.values().stream().mapToDouble(Double::doubleValue).max();
        java.util.OptionalDouble minDailyOpt = dailyExpensesMap.values().stream().mapToDouble(Double::doubleValue).min();
        
        // Find highest and lowest expense days
        java.util.Map<String, Object> topExpenseDay = null;
        java.util.Map<String, Object> lowestExpenseDay = null;
        
        if (!dailyExpensesMap.isEmpty()) {
            // Find day with highest expenses
            var maxEntry = dailyExpensesMap.entrySet().stream()
                .max(java.util.Map.Entry.comparingByValue())
                .orElse(null);
            
            if (maxEntry != null) {
                topExpenseDay = new java.util.HashMap<>();
                topExpenseDay.put("date", maxEntry.getKey().toString());
                topExpenseDay.put("amount", maxEntry.getValue());
                topExpenseDay.put("dayName", maxEntry.getKey().getDayOfWeek().toString());
            }
            
            // Find day with lowest expenses (excluding zero days)
            var minEntry = dailyExpensesMap.entrySet().stream()
                .filter(entry -> entry.getValue() > 0)
                .min(java.util.Map.Entry.comparingByValue())
                .orElse(null);
            
            if (minEntry != null) {
                lowestExpenseDay = new java.util.HashMap<>();
                lowestExpenseDay.put("date", minEntry.getKey().toString());
                lowestExpenseDay.put("amount", minEntry.getValue());
                lowestExpenseDay.put("dayName", minEntry.getKey().getDayOfWeek().toString());
            }
        }
        
        // Find most active category
        String mostActiveCategory = categoryBreakdown.entrySet().stream()
            .max(java.util.Map.Entry.comparingByValue())
            .map(java.util.Map.Entry::getKey)
            .orElse("");
        
        // Get top categories (limit to top 5)
        java.util.List<java.util.Map<String, Object>> topCategories = categoryBreakdown.entrySet().stream()
            .sorted(java.util.Map.Entry.<String, Double>comparingByValue().reversed())
            .limit(5)
            .map(entry -> {
                java.util.Map<String, Object> categoryMap = new java.util.HashMap<>();
                categoryMap.put("name", entry.getKey());
                categoryMap.put("value", entry.getValue());
                categoryMap.put("percentage", totalAmount > 0 ? Math.round((entry.getValue() / totalAmount) * 100) : 0);
                return categoryMap;
            })
            .collect(java.util.stream.Collectors.toList());
        
        // Convert daily expenses to list format for charts
        java.util.List<java.util.Map<String, Object>> dailyData = new java.util.ArrayList<>();
        java.time.LocalDate currentDate = startDate;
        
        while (!currentDate.isAfter(endDate)) {
            java.util.Map<String, Object> dayData = new java.util.HashMap<>();
            dayData.put("date", currentDate.toString());
            dayData.put("amount", dailyExpensesMap.getOrDefault(currentDate, 0.0));
            dayData.put("dayName", currentDate.getDayOfWeek().toString());
            dailyData.add(dayData);
            currentDate = currentDate.plusDays(1);
        }
        
        // Calculate average per category
        java.util.List<java.util.Map<String, Object>> averagePerCategory = categoryBreakdown.entrySet().stream()
            .map(entry -> {
                String category = entry.getKey();
                double totalCategoryAmount = entry.getValue();
                long categoryTransactionCount = expenseTransactions.stream()
                    .filter(e -> category.equals(e.getCategory()))
                    .count();
                
                double avgAmount = categoryTransactionCount > 0 ? totalCategoryAmount / categoryTransactionCount : 0;
                
                java.util.Map<String, Object> categoryData = new java.util.HashMap<>();
                categoryData.put("category", category);
                categoryData.put("avgAmount", Math.round(avgAmount * 100.0) / 100.0);
                categoryData.put("totalAmount", totalCategoryAmount);
                categoryData.put("transactionCount", categoryTransactionCount);
                return categoryData;
            })
            .sorted((a, b) -> Double.compare((Double) b.get("totalAmount"), (Double) a.get("totalAmount")))
            .collect(java.util.stream.Collectors.toList());
        
        // Build response
        java.util.Map<String, Object> result = new java.util.HashMap<>();
        result.put("totalAmount", Math.round(totalAmount * 100.0) / 100.0);
        result.put("totalExpenses", Math.round(totalExpenses * 100.0) / 100.0);
        result.put("totalIncome", Math.round(totalIncome * 100.0) / 100.0);
        result.put("totalSavings", Math.round(totalSavings * 100.0) / 100.0);
        result.put("netIncome", Math.round(netIncome * 100.0) / 100.0);
        result.put("avgDaily", Math.round(avgDaily * 100.0) / 100.0);
        result.put("maxDaily", maxDailyOpt.orElse(0.0));
        result.put("minDaily", minDailyOpt.orElse(0.0));
        result.put("transactionCount", expenseTransactions.size());
        result.put("incomeTransactionCount", incomeTransactions.size());
        result.put("savingsTransactionCount", savingsTransactions.size());
        result.put("categoryBreakdown", topCategories);
        result.put("dailyExpenses", dailyData);
        result.put("startDate", startDateStr);
        result.put("endDate", endDateStr);
        result.put("dayCount", dayCount);
        result.put("topExpenseDay", topExpenseDay);
        result.put("lowestExpenseDay", lowestExpenseDay);
        result.put("mostActiveCategory", mostActiveCategory);
        result.put("averagePerCategory", averagePerCategory);
        
        return result;
    }
}
