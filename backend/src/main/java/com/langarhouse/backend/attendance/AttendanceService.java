package com.langarhouse.backend.attendance;

import com.langarhouse.backend.attendance.dto.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;

    // ── CREATE ────────────────────────────────────────────
    public AttendanceResponse create(AttendanceRequest request) {

        // Prevent duplicate attendance
        attendanceRepository
                .findByStaffIdAndDate(
                        request.getStaffId(), request.getDate())
                .ifPresent(existing -> {
                    throw new IllegalArgumentException(
                            "Attendance already marked for staff "
                                    + request.getStaffId()
                                    + " on " + request.getDate());
                });

        log.info("Marking attendance for staff: {} on {}",
                request.getStaffId(), request.getDate());

        StaffAttendance entity = toEntity(request);
        return toResponse(attendanceRepository.save(entity));
    }

    // ── GET ALL ───────────────────────────────────────────
    public List<AttendanceResponse> getAll() {
        return attendanceRepository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ── GET BY DATE ───────────────────────────────────────
    public List<AttendanceResponse> getByDate(LocalDate date) {
        return attendanceRepository.findByDate(date)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ── GET BY STAFF ──────────────────────────────────────
    public List<AttendanceResponse> getByStaff(String staffId) {
        return attendanceRepository.findByStaffId(staffId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ── GET PRESENT COUNT ─────────────────────────────────
    public Long getPresentCount(LocalDate date) {
        return attendanceRepository.countPresentByDate(date);
    }

    // ── UPDATE ────────────────────────────────────────────
    public AttendanceResponse update(
            Long id, AttendanceRequest request) {
        StaffAttendance existing = attendanceRepository
                .findById(id)
                .orElseThrow(() -> new RuntimeException(
                        "Attendance not found with id: " + id));

        existing.setStatus(request.getStatus());
        existing.setShift(request.getShift());
        existing.setRole(request.getRole());

        return toResponse(attendanceRepository.save(existing));
    }

    // ── DELETE ────────────────────────────────────────────
    public void delete(Long id) {
        if (!attendanceRepository.existsById(id)) {
            throw new RuntimeException(
                    "Attendance not found with id: " + id);
        }
        attendanceRepository.deleteById(id);
    }

    // ── MAPPERS ───────────────────────────────────────────
    private StaffAttendance toEntity(AttendanceRequest request) {
        return StaffAttendance.builder()
                .date(request.getDate())
                .staffId(request.getStaffId())
                .role(request.getRole())
                .status(request.getStatus())
                .shift(request.getShift())
                .build();
    }

    private AttendanceResponse toResponse(StaffAttendance e) {
        return AttendanceResponse.builder()
                .id(e.getId())
                .date(e.getDate())
                .staffId(e.getStaffId())
                .role(e.getRole())
                .status(e.getStatus())
                .shift(e.getShift())
                .build();
    }
}