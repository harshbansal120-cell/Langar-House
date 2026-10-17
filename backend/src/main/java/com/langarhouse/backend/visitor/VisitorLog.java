package com.langarhouse.backend.visitor;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "visitor_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VisitorLog {

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

    @NotNull(message = "Visitor count is required")
    @Min(value = 0, message = "Visitor count cannot be negative")
    @Column(name = "visitor_count", nullable = false)
    private Integer visitorCount;

    @Column(length = 500)
    private String notes;

    @Column(name = "is_special_day")
    private Boolean isSpecialDay = false;
}