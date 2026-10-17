package com.langarhouse.backend.attendance;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(
        name = "staff_attendance",
        uniqueConstraints = {
                // Prevent duplicate attendance for same staff on same date
                @UniqueConstraint(
                        columnNames = {"staff_id", "date"},
                        name = "uk_staff_date"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StaffAttendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Date is required")
    @Column(nullable = false)
    private LocalDate date;

    @NotBlank(message = "Staff ID is required")
    @Column(name = "staff_id", nullable = false)
    private String staffId;  // Supabase auth.users.id

    @NotBlank(message = "Role is required")
    @Column(nullable = false)
    private String role;  // Cook, Volunteer, Manager etc.

    @NotNull(message = "Status is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AttendanceStatus status;

    @NotNull(message = "Shift is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ShiftType shift;
}