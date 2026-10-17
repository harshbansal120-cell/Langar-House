package com.langarhouse.backend.food;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface FoodPreparedRepository
        extends JpaRepository<FoodPrepared, Long> {

    List<FoodPrepared> findByDate(LocalDate date);

    List<FoodPrepared> findByDateBetween(
            LocalDate start, LocalDate end);

    List<FoodPrepared> findByDateAndMealType(
            LocalDate date,
            com.langarhouse.backend.visitor.MealType mealType);
}