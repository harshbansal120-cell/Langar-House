package com.langarhouse.backend.audit;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;

@RestController
@RequestMapping("/api/audit")
public class AuditLogController {

    private final AuditLogRepository repository;

    public AuditLogController(AuditLogRepository repository) {
        this.repository = repository;
    }

    // Paginated full audit trail — for admin dashboard
    @GetMapping
    public ResponseEntity<Page<AuditLog>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(
                repository.findAllByOrderByCreatedAtDesc(PageRequest.of(page, size))
        );
    }

    // Filter by user
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<AuditLog>> getByUser(@PathVariable String userId) {
        return ResponseEntity.ok(repository.findByUserIdOrderByCreatedAtDesc(userId));
    }

    // Filter by module (FOOD, VISITOR, etc.)
    @GetMapping("/module/{module}")
    public ResponseEntity<List<AuditLog>> getByModule(@PathVariable String module) {
        return ResponseEntity.ok(repository.findByModuleOrderByCreatedAtDesc(module.toUpperCase()));
    }

    // Filter by date range — useful for daily audit reports
    @GetMapping("/range")
    public ResponseEntity<List<AuditLog>> getByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(repository.findByCreatedAtBetweenOrderByCreatedAtDesc(
                from.atStartOfDay().toInstant(ZoneOffset.UTC),
                to.plusDays(1).atStartOfDay().toInstant(ZoneOffset.UTC)
        ));
    }
}