package com.langarhouse.backend.expense;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface ExpenseRepository
        extends JpaRepository<Expense, Long> {

    List<Expense> findByDate(LocalDate date);

    List<Expense> findByCategory(String category);

    List<Expense> findByDateBetween(
            LocalDate start, LocalDate end);

    // Total expenses for a date range
    @Query("SELECT SUM(e.total) FROM Expense e " +
            "WHERE e.date BETWEEN :start AND :end")
    Double sumTotalByDateBetween(
            LocalDate start, LocalDate end);

    // Total expenses for a specific date
    @Query("SELECT SUM(e.total) FROM Expense e " +
            "WHERE e.date = :date")
    Double sumTotalByDate(LocalDate date);
}