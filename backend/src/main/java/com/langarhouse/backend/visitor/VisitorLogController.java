package com.langarhouse.backend.visitor;

import com.langarhouse.backend.visitor.dto.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.domain.*;

@Slf4j
@RestController
@RequestMapping("/api/visitors")
@RequiredArgsConstructor
public class VisitorLogController {

    private final VisitorLogService visitorLogService;

    // POST /api/visitors
    @PostMapping
    public ResponseEntity<VisitorLogResponse> create(
            @Valid @RequestBody VisitorLogRequest request) {
        VisitorLogResponse response = visitorLogService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // GET /api/visitors
    @GetMapping
    public ResponseEntity<List<VisitorLogResponse>> getAll() {
        return ResponseEntity.ok(visitorLogService.getAll());
    }

    // GET /api/visitors/{id}
    @GetMapping("/{id}")
    public ResponseEntity<VisitorLogResponse> getById(
            @PathVariable Long id) {
        return ResponseEntity.ok(visitorLogService.getById(id));
    }

    // GET /api/visitors/by-date?date=2026-03-22
    @GetMapping("/by-date")
    public ResponseEntity<List<VisitorLogResponse>> getByDate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate date) {
        return ResponseEntity.ok(visitorLogService.getByDate(date));
    }

    // PUT /api/visitors/{id}
    @PutMapping("/{id}")
    public ResponseEntity<VisitorLogResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody VisitorLogRequest request) {
        return ResponseEntity.ok(visitorLogService.update(id, request));
    }

    // DELETE /api/visitors/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        visitorLogService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // GET /api/visitors/paged?page=0&size=10
    @GetMapping("/paged")
    public ResponseEntity<Page<VisitorLogResponse>> getAllPaged(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size,
                Sort.by("date").descending());

        return ResponseEntity.ok(
                visitorLogService.getAllPaged(pageable));
    }
}
