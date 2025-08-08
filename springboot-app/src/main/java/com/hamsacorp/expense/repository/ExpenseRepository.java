package com.hamsacorp.expense.repository;

import com.hamsacorp.expense.model.Expense;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    List<Expense> findAllByOrderByDateDesc();
    List<Expense> findAllByDateBetweenOrderByDateDesc(LocalDate from, LocalDate to);
    Page<Expense> findAllByOrderByDateDesc(Pageable pageable);
    Page<Expense> findAllByDateBetweenOrderByDateDesc(LocalDate from, LocalDate to, Pageable pageable);
    Page<Expense> findAllByCreatedByOrderByDateDesc(String createdBy, Pageable pageable);
    List<Expense> findAllByDateBetweenAndCreatedByOrderByDateDesc(LocalDate from, LocalDate to, String createdBy);
    List<Expense> findAllByCreatedByAndDateBetweenOrderByDateDesc(String createdBy, LocalDate from, LocalDate to);
    
    // Daily expense queries
    List<Expense> findAllByCreatedByAndDateOrderByIdDesc(String createdBy, LocalDate date);
    
    @Query("SELECT e FROM Expense e WHERE e.createdBy = :createdBy AND e.date = :date ORDER BY e.id DESC")
    List<Expense> findDailyExpensesByCreatedByAndDate(@Param("createdBy") String createdBy, @Param("date") LocalDate date);
}
