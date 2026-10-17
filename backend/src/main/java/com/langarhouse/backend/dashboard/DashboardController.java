package com.langarhouse.backend.dashboard;

import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    // GET /api/dashboard/summary?date=2026-03-22
    @GetMapping("/summary")
    public ResponseEntity<DashboardResponse> getSummary(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate date) {

        // Default to today if no date provided
        if (date == null) {
            date = LocalDate.now();
        }

        return ResponseEntity.ok(
                dashboardService.getSummary(date));
    }
}


