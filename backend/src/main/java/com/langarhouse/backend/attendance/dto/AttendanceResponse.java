package com.langarhouse.backend.attendance.dto;

import com.langarhouse.backend.attendance.AttendanceStatus;
import com.langarhouse.backend.attendance.ShiftType;
import lombok.*;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceResponse {

    private Long id;
    private LocalDate date;
    private String staffId;
    private String role;
    private AttendanceStatus status;
    private ShiftType shift;
}