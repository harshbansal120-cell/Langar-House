package com.langarhouse.backend.visitor.dto;

import com.langarhouse.backend.visitor.MealType;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class VisitorLogRequest {

    @NotNull(message = "Date is required")
    private LocalDate date;

    @NotNull(message = "Meal type is required")
    private MealType mealType;

    @NotNull(message = "Visitor count is required")
    @Min(value = 0, message = "Visitor count cannot be negative")
    private Integer visitorCount;

    @Size(max = 500, message = "Notes cannot exceed 500 characters")
    private String notes;

    private Boolean isSpecialDay = false;
}