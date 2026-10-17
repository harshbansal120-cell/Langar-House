package com.langarhouse.backend.visitor;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface VisitorLogRepository
        extends JpaRepository<VisitorLog, Long> {

    // Find all logs for a specific date
    List<VisitorLog> findByDate(LocalDate date);

    // Find all logs for a specific meal type
    List<VisitorLog> findByMealType(MealType mealType);

    // Find all logs between two dates
    List<VisitorLog> findByDateBetween(LocalDate start, LocalDate end);
}





