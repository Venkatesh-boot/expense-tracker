package com.hamsacorp.expense.controller;

import com.hamsacorp.expense.model.Expense;
import com.hamsacorp.expense.service.ExpenseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Optional;

@RestController
@RequestMapping("/api/expenses")
@CrossOrigin(origins = "*") // Allow CORS for all origins; adjust as needed for security
public class ExpenseController {
    @Autowired
    private ExpenseService expenseService;

    @PostMapping
    public ResponseEntity<Expense> addExpense(@RequestBody Expense expense, @RequestAttribute("userEmail") String email) {
        expense.setCreatedBy(email);
        return ResponseEntity.ok(expenseService.saveExpense(expense));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Expense> updateExpense(@PathVariable Long id, @RequestBody Expense expense, @RequestAttribute("userEmail") String email) {
        Optional<Expense> existingExpenseOpt = expenseService.getExpenseById(id);
        if (existingExpenseOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Expense existingExpense = existingExpenseOpt.get();
        if (!email.equals(existingExpense.getCreatedBy())) {
            return ResponseEntity.status(403).build(); // Forbidden
        }
        expense.setId(id);
        expense.setCreatedBy(email); // Ensure the updated expense is still associated with the authenticated user
        return ResponseEntity.ok(expenseService.saveExpense(expense));
    }

    @GetMapping
    public ResponseEntity<?> getAllExpenses(
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            HttpServletRequest request) {
        String userEmail = (String) request.getAttribute("userEmail");
        if (userEmail == null) {
            return ResponseEntity.status(401).body("Unauthorized: No user info in token");
        }
        if (from != null && to != null) {
            // No pagination if both dates are provided
            return ResponseEntity.ok(expenseService.getExpensesByDateRangeAndCreatedBy(from, to, userEmail));
        } else {
            Pageable pageable = PageRequest.of(page, size);
            return ResponseEntity.ok(expenseService.getAllExpensesByCreatedBy(userEmail, pageable));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Expense> getExpenseById(@PathVariable Long id) {
        Optional<Expense> expense = expenseService.getExpenseById(id);
        return expense.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExpense(@PathVariable Long id) {
        expenseService.deleteExpense(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/summary")
    public ResponseEntity<?> getSummary(@RequestAttribute("userEmail") String email) {
        return ResponseEntity.ok(expenseService.getSummaryForUser(email));
    }

    @GetMapping("/monthly-details")
    public ResponseEntity<?> getMonthlyExpensesDetail(
            @RequestParam(defaultValue = "0") int year,
            @RequestParam(defaultValue = "0") int month,
            @RequestAttribute("userEmail") String email) {
        try {
            // If year and month are not provided, use current month
            if (year == 0 || month == 0) {
                java.time.LocalDate now = java.time.LocalDate.now();
                year = year == 0 ? now.getYear() : year;
                month = month == 0 ? now.getMonthValue() : month;
            }
            return ResponseEntity.ok(expenseService.getMonthlyExpensesDetail(email, year, month));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error fetching monthly expenses detail: " + e.getMessage());
        }
    }

    @GetMapping("/yearly-details")
    public ResponseEntity<?> getYearlyExpensesDetail(
            @RequestParam(defaultValue = "0") int year,
            @RequestAttribute("userEmail") String email) {
        try {
            // If year is not provided, use current year
            if (year == 0) {
                year = java.time.LocalDate.now().getYear();
            }
            return ResponseEntity.ok(expenseService.getYearlyExpensesDetail(email, year));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error fetching yearly expenses detail: " + e.getMessage());
        }
    }

    @GetMapping("/daily-details")
    public ResponseEntity<?> getDailyExpensesDetail(
            @RequestParam(required = false) String date,
            @RequestAttribute("userEmail") String email) {
        try {
            // If date is not provided, use current date
            if (date == null || date.isEmpty()) {
                date = java.time.LocalDate.now().toString();
            }
            return ResponseEntity.ok(expenseService.getDailyExpensesDetail(email, date));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error fetching daily expenses detail: " + e.getMessage());
        }
    }
}
