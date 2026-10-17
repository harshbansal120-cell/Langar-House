package com.langarhouse.backend.food.dto;

import com.langarhouse.backend.visitor.MealType;
import lombok.*;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FoodPreparedResponse {

    private Long id;
    private LocalDate date;
    private MealType mealType;
    private String dishName;
    private Double quantityPrepared;
    private Double quantityWasted;
    private Double quantityConsumed;   // computed
    private Double efficiencyPercent;  // computed
    private String unit;
}