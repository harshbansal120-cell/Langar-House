package com.langarhouse.backend.dashboard;

import com.langarhouse.backend.attendance.*;
import com.langarhouse.backend.expense.ExpenseRepository;
import com.langarhouse.backend.food.FoodPreparedRepository;
import com.langarhouse.backend.inventory.InventoryRepository;
import com.langarhouse.backend.visitor.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DashboardService {

    private final VisitorLogRepository visitorLogRepository;
    private final FoodPreparedRepository foodPreparedRepository;
    private final ExpenseRepository expenseRepository;
    private final InventoryRepository inventoryRepository;
    private final AttendanceRepository attendanceRepository;

    public DashboardResponse getSummary(LocalDate date) {
        log.info("Generating dashboard summary for: {}", date);

        return DashboardResponse.builder()
                .date(date)
                .totalVisitors(getTotalVisitors(date))
                .breakfastVisitors(getVisitorsByMeal(date, MealType.BREAKFAST))
                .lunchVisitors(getVisitorsByMeal(date, MealType.LUNCH))
                .dinnerVisitors(getVisitorsByMeal(date, MealType.DINNER))
                .totalFoodPrepared(getTotalFoodPrepared(date))
                .totalFoodConsumed(getTotalFoodConsumed(date))
                .totalFoodWasted(getTotalFoodWasted(date))
                .overallEfficiencyPercent(getEfficiency(date))
                .totalExpenses(getTotalExpenses(date))
                .lowStockCount(getLowStockCount())
                .lowStockItems(getLowStockItemNames())
                .staffPresent(getStaffByStatus(date, AttendanceStatus.PRESENT))
                .staffAbsent(getStaffByStatus(date, AttendanceStatus.ABSENT))
                .staffOnLeave(getStaffByStatus(date, AttendanceStatus.LEAVE))
                .build();
    }

    // ── VISITORS ──────────────────────────────────────────

    private Long getTotalVisitors(LocalDate date) {
        return visitorLogRepository.findByDate(date)
                .stream()
                .mapToLong(v -> v.getVisitorCount())
                .sum();
    }

    private Long getVisitorsByMeal(LocalDate date, MealType mealType) {
        return visitorLogRepository
                .findByDate(date)
                .stream()
                .filter(v -> v.getMealType() == mealType)
                .mapToLong(v -> v.getVisitorCount())
                .sum();
    }

    // ── FOOD ──────────────────────────────────────────────

    private Double getTotalFoodPrepared(LocalDate date) {
        return foodPreparedRepository.findByDate(date)
                .stream()
                .mapToDouble(f -> f.getQuantityPrepared())
                .sum();
    }

    private Double getTotalFoodWasted(LocalDate date) {
        return foodPreparedRepository.findByDate(date)
                .stream()
                .mapToDouble(f -> f.getQuantityWasted())
                .sum();
    }

    private Double getTotalFoodConsumed(LocalDate date) {
        double prepared = getTotalFoodPrepared(date);
        double wasted = getTotalFoodWasted(date);
        return prepared - wasted;
    }

    private Double getEfficiency(LocalDate date) {
        double prepared = getTotalFoodPrepared(date);
        if (prepared == 0) return 0.0;
        double consumed = getTotalFoodConsumed(date);
        return Math.round((consumed / prepared) * 10000.0) / 100.0;
    }

    // ── EXPENSES ──────────────────────────────────────────

    private Double getTotalExpenses(LocalDate date) {
        Double total = expenseRepository.sumTotalByDate(date);
        return total != null ? total : 0.0;
    }

    // ── INVENTORY ─────────────────────────────────────────

    private Integer getLowStockCount() {
        return (int) inventoryRepository.findAll()
                .stream()
                .filter(i -> i.getQuantity() <= i.getThreshold())
                .count();
    }

    private List<String> getLowStockItemNames() {
        return inventoryRepository.findAll()
                .stream()
                .filter(i -> i.getQuantity() <= i.getThreshold())
                .map(i -> i.getItemName())
                .collect(Collectors.toList());
    }

    // ── ATTENDANCE ────────────────────────────────────────

    private Long getStaffByStatus(
            LocalDate date, AttendanceStatus status) {
        return attendanceRepository
                .findByDateAndStatus(date, status)
                .stream()
                .count();
    }
}