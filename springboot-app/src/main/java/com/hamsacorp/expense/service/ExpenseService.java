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
}
