package com.langarhouse.backend.expense.dto;

import lombok.*;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExpenseResponse {

    private Long id;
    private LocalDate date;
    private String itemName;
    private String category;
    private Double quantity;
    private String unit;
    private Double price;
    private Double total;  // computed: quantity * price
}