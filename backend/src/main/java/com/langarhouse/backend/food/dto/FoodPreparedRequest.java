package com.langarhouse.backend.food.dto;

import com.langarhouse.backend.visitor.MealType;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FoodPreparedRequest {

    @NotNull(message = "Date is required")
    private LocalDate date;

    @NotNull(message = "Meal type is required")
    private MealType mealType;

    @NotBlank(message = "Dish name is required")
    private String dishName;

    @NotNull(message = "Quantity prepared is required")
    @DecimalMin(value = "0.0", message = "Cannot be negative")
    private Double quantityPrepared;

    @NotNull(message = "Quantity wasted is required")
    @DecimalMin(value = "0.0", message = "Cannot be negative")
    private Double quantityWasted;

    private String unit = "kg";
}