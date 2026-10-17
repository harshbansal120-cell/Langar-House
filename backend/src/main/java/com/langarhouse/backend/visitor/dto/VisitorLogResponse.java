package com.langarhouse.backend.visitor.dto;

import com.langarhouse.backend.visitor.MealType;
import lombok.*;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VisitorLogResponse {

    private Long id;
    private LocalDate date;
    private MealType mealType;
    private Integer visitorCount;
    private String notes;
    private Boolean isSpecialDay;
}