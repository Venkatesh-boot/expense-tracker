package com.hamsacorp.expense.repository;

import com.hamsacorp.expense.model.Expense;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    List<Expense> findAllByOrderByDateDesc();
    List<Expense> findAllByDateBetweenOrderByDateDesc(LocalDate from, LocalDate to);
    Page<Expense> findAllByOrderByDateDesc(Pageable pageable);
    Page<Expense> findAllByDateBetweenOrderByDateDesc(LocalDate from, LocalDate to, Pageable pageable);
}
