package com.langarhouse.backend.food;

import com.langarhouse.backend.visitor.MealType;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "food_prepared")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FoodPrepared {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Date is required")
    @Column(nullable = false)
    private LocalDate date;

    @NotNull(message = "Meal type is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "meal_type", nullable = false)
    private MealType mealType;

    @NotBlank(message = "Dish name is required")
    @Column(name = "dish_name", nullable = false)
    private String dishName;

    @NotNull(message = "Quantity prepared is required")
    @DecimalMin(value = "0.0", message = "Quantity prepared cannot be negative")
    @Column(name = "quantity_prepared", nullable = false)
    private Double quantityPrepared;

    @NotNull(message = "Quantity wasted is required")
    @DecimalMin(value = "0.0", message = "Quantity wasted cannot be negative")
    @Column(name = "quantity_wasted", nullable = false)
    private Double quantityWasted;

    @Column(name = "unit")
    private String unit = "kg";
}