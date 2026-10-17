package com.langarhouse.backend.inventory.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryResponse {

    private Long id;
    private String itemName;
    private String category;
    private Double quantity;
    private String unit;
    private Double threshold;
    private Boolean isLowStock;  // computed: quantity <= threshold
}