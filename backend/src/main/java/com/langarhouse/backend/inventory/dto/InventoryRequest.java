package com.langarhouse.backend.inventory.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class InventoryRequest {

    @NotBlank(message = "Item name is required")
    private String itemName;

    @NotBlank(message = "Category is required")
    private String category;

    @NotNull(message = "Quantity is required")
    @DecimalMin(value = "0.0", message = "Cannot be negative")
    private Double quantity;

    @NotBlank(message = "Unit is required")
    private String unit;

    @NotNull(message = "Threshold is required")
    @DecimalMin(value = "0.0", message = "Cannot be negative")
    private Double threshold;
}