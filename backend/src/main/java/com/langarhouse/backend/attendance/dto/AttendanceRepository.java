package com.langarhouse.backend.attendance;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository
        extends JpaRepository<StaffAttendance, Long> {

    List<StaffAttendance> findByDate(LocalDate date);

    List<StaffAttendance> findByStaffId(String staffId);

    List<StaffAttendance> findByDateAndStatus(
            LocalDate date, AttendanceStatus status);

    // Check for duplicate attendance
    Optional<StaffAttendance> findByStaffIdAndDate(
            String staffId, LocalDate date);

    // Count present staff for a date
    @Query("SELECT COUNT(a) FROM StaffAttendance a " +
            "WHERE a.date = :date " +
            "AND a.status = 'PRESENT'")
    Long countPresentByDate(LocalDate date);
}