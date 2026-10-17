package com.langarhouse.backend.attendance.dto;

import com.langarhouse.backend.attendance.AttendanceStatus;
import com.langarhouse.backend.attendance.ShiftType;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceRequest {

    @NotNull(message = "Date is required")
    private LocalDate date;

    @NotBlank(message = "Staff ID is required")
    private String staffId;

    @NotBlank(message = "Role is required")
    private String role;

    @NotNull(message = "Status is required")
    private AttendanceStatus status;

    @NotNull(message = "Shift is required")
    private ShiftType shift;
}