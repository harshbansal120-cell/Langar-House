package com.langarhouse.backend.visitor;

import com.langarhouse.backend.visitor.dto.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
@Slf4j
@Service
@RequiredArgsConstructor
public class VisitorLogService {

    private final VisitorLogRepository visitorLogRepository;

    // ── CREATE ────────────────────────────────────────────
    public VisitorLogResponse create(VisitorLogRequest request) {
        log.info("Creating visitor log for date: {}, meal: {}",
                request.getDate(), request.getMealType());

        VisitorLog entity = toEntity(request);
        VisitorLog saved = visitorLogRepository.save(entity);

        log.info("Visitor log created with id: {}", saved.getId());
        return toResponse(saved);
    }

    // ── GET ALL ───────────────────────────────────────────
    public List<VisitorLogResponse> getAll() {
        log.info("Fetching all visitor logs");
        return visitorLogRepository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ── GET BY DATE ───────────────────────────────────────
    public List<VisitorLogResponse> getByDate(LocalDate date) {
        log.info("Fetching visitor logs for date: {}", date);
        return visitorLogRepository.findByDate(date)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ── GET BY ID ─────────────────────────────────────────
    public VisitorLogResponse getById(Long id) {
        log.info("Fetching visitor log with id: {}", id);
        VisitorLog entity = visitorLogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(
                        "Visitor log not found with id: " + id));
        return toResponse(entity);
    }

    // ── UPDATE ────────────────────────────────────────────
    public VisitorLogResponse update(Long id, VisitorLogRequest request) {
        log.info("Updating visitor log with id: {}", id);
        VisitorLog existing = visitorLogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(
                        "Visitor log not found with id: " + id));

        existing.setDate(request.getDate());
        existing.setMealType(request.getMealType());
        existing.setVisitorCount(request.getVisitorCount());
        existing.setNotes(request.getNotes());
        existing.setIsSpecialDay(request.getIsSpecialDay());

        VisitorLog updated = visitorLogRepository.save(existing);
        log.info("Visitor log updated with id: {}", updated.getId());
        return toResponse(updated);
    }

    // ── DELETE ────────────────────────────────────────────
    public void delete(Long id) {
        log.info("Deleting visitor log with id: {}", id);
        if (!visitorLogRepository.existsById(id)) {
            throw new RuntimeException(
                    "Visitor log not found with id: " + id);
        }
        visitorLogRepository.deleteById(id);
        log.info("Visitor log deleted with id: {}", id);
    }

    // ── MAPPERS ───────────────────────────────────────────
    private VisitorLog toEntity(VisitorLogRequest request) {
        return VisitorLog.builder()
                .date(request.getDate())
                .mealType(request.getMealType())
                .visitorCount(request.getVisitorCount())
                .notes(request.getNotes())
                .isSpecialDay(request.getIsSpecialDay() != null
                        ? request.getIsSpecialDay() : false)
                .build();
    }

    private VisitorLogResponse toResponse(VisitorLog entity) {
        return VisitorLogResponse.builder()
                .id(entity.getId())
                .date(entity.getDate())
                .mealType(entity.getMealType())
                .visitorCount(entity.getVisitorCount())
                .notes(entity.getNotes())
                .isSpecialDay(entity.getIsSpecialDay())
                .build();
    }
    // ── GET ALL PAGED ─────────────────────────────────────
    public Page<VisitorLogResponse> getAllPaged(Pageable pageable) {
        return visitorLogRepository.findAll(pageable)
                .map(this::toResponse);
    }

}