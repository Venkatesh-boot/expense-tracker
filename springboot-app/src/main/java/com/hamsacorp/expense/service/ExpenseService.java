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
}
