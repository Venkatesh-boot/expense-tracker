package com.hamsacorp.expense.controller;

import com.hamsacorp.expense.service.ExpenseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

/**
 * Test controller for daily expenses functionality
 * Remove this file in production - for development testing only
 */
@RestController
@RequestMapping("/api/test")
@CrossOrigin(origins = "*")
public class DailyExpensesTestController {

    @Autowired
    private ExpenseService expenseService;

    @GetMapping("/daily-expenses-demo")
    public ResponseEntity<?> getDailyExpensesDemo(@RequestParam(required = false) String email) {
        try {
            // Use test email if not provided
            String testEmail = email != null ? email : "test@example.com";
            String today = LocalDate.now().toString();
            
            Map<String, Object> response = expenseService.getDailyExpensesDetail(testEmail, today);
            
            Map<String, Object> result = new HashMap<>();
            result.put("message", "Daily expenses API test successful");
            result.put("testEmail", testEmail);
            result.put("date", today);
            result.put("data", response);
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Test failed");
            error.put("message", e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    @GetMapping("/daily-expenses-mock")
    public ResponseEntity<?> getMockDailyExpenses() {
        // Return mock data for frontend testing
        Map<String, Object> mockData = new HashMap<>();
        mockData.put("totalAmount", 1250.75);
        mockData.put("avgHourly", 52.11);
        mockData.put("maxHourly", 450.25);
        mockData.put("minHourly", 0.0);
        mockData.put("transactionCount", 8);
        
        // Mock category breakdown
        java.util.List<Map<String, Object>> categories = java.util.Arrays.asList(
            createCategory("Food", 450.25, 36),
            createCategory("Transportation", 300.00, 24),
            createCategory("Shopping", 250.50, 20),
            createCategory("Entertainment", 150.00, 12),
            createCategory("Bills", 100.00, 8)
        );
        mockData.put("categoryBreakdown", categories);
        
        // Mock hourly expenses
        java.util.List<Map<String, Object>> hourlyData = new java.util.ArrayList<>();
        for (int hour = 0; hour < 24; hour++) {
            Map<String, Object> hourData = new HashMap<>();
            hourData.put("hour", hour);
            // Add some mock data for business hours
            if (hour >= 8 && hour <= 20) {
                hourData.put("amount", Math.random() * 100);
            } else {
                hourData.put("amount", 0.0);
            }
            hourlyData.add(hourData);
        }
        mockData.put("hourlyExpenses", hourlyData);
        
        mockData.put("previousDayTotal", 980.30);
        mockData.put("percentChange", 27.59);
        mockData.put("date", LocalDate.now().toString());
        mockData.put("dayName", LocalDate.now().getDayOfWeek().toString());
        mockData.put("dailyBudget", 100.00);
        mockData.put("budgetUsed", 1250.75);
        mockData.put("budgetRemaining", -1150.75);
        mockData.put("topExpenseCategory", "Food");
        
        Map<String, Double> timeOfDay = new HashMap<>();
        timeOfDay.put("morning", 125.75);
        timeOfDay.put("afternoon", 650.25);
        timeOfDay.put("evening", 400.00);
        timeOfDay.put("night", 74.75);
        mockData.put("expensesByTimeOfDay", timeOfDay);
        
        return ResponseEntity.ok(mockData);
    }
    
    private Map<String, Object> createCategory(String name, double value, int percentage) {
        Map<String, Object> category = new HashMap<>();
        category.put("name", name);
        category.put("value", value);
        category.put("percentage", percentage);
        return category;
    }
}
