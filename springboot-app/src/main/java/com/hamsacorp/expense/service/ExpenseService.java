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
        
        // Fetch all expenses for the specified month
        var monthlyExpenses = expenseRepository.findAllByCreatedByAndDateBetweenOrderByDateDesc(email, startOfMonth, endOfMonth);
        
        // Filter only expense type transactions
        var expenseTransactions = monthlyExpenses.stream()
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
        
        // Previous month comparison
        java.time.YearMonth previousMonth = targetMonth.minusMonths(1);
        java.time.LocalDate prevStartOfMonth = previousMonth.atDay(1);
        java.time.LocalDate prevEndOfMonth = previousMonth.atEndOfMonth();
        
        var previousMonthExpenses = expenseRepository.findAllByCreatedByAndDateBetweenOrderByDateDesc(email, prevStartOfMonth, prevEndOfMonth);
        double previousMonthTotal = previousMonthExpenses.stream()
            .filter(e -> e.getType() == Expense.ExpenseType.EXPENSE)
            .mapToDouble(Expense::getAmount).sum();
        
        // Calculate percentage change
        double percentChange = previousMonthTotal > 0 ? ((totalAmount - previousMonthTotal) / previousMonthTotal) * 100 : 0;
        
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
        
        // Build response
        java.util.Map<String, Object> result = new java.util.HashMap<>();
        result.put("totalAmount", totalAmount);
        result.put("avgDaily", Math.round(avgDaily * 100.0) / 100.0);
        result.put("maxDaily", maxDailyOpt.orElse(0.0));
        result.put("minDaily", minDailyOpt.orElse(0.0));
        result.put("transactionCount", expenseTransactions.size());
        result.put("categoryBreakdown", topCategories);
        result.put("dailyExpenses", dailyData);
        result.put("previousMonthTotal", previousMonthTotal);
        result.put("percentChange", Math.round(percentChange * 100.0) / 100.0);
        result.put("year", year);
        result.put("month", month);
        result.put("monthName", targetMonth.getMonth().toString());
        
        return result;
    }
}
