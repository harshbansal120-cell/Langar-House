package com.langarhouse.backend.dashboard;

import lombok.*;
import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardResponse {

    private LocalDate date;

    // ── Visitors ──────────────────────────────────────────
    private Long totalVisitors;
    private Long breakfastVisitors;
    private Long lunchVisitors;
    private Long dinnerVisitors;

    // ── Food ──────────────────────────────────────────────
    private Double totalFoodPrepared;
    private Double totalFoodConsumed;
    private Double totalFoodWasted;
    private Double overallEfficiencyPercent;

    // ── Expenses ──────────────────────────────────────────
    private Double totalExpenses;

    // ── Inventory ─────────────────────────────────────────
    private Integer lowStockCount;
    private List<String> lowStockItems;

    // ── Attendance ────────────────────────────────────────
    private Long staffPresent;
    private Long staffAbsent;
    private Long staffOnLeave;
}