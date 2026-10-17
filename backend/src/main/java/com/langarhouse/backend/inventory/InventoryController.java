package com.langarhouse.backend.inventory;

import com.langarhouse.backend.inventory.dto.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    @PostMapping
    public ResponseEntity<InventoryResponse> create(
            @Valid @RequestBody InventoryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(inventoryService.create(request));
    }

    @GetMapping
    public ResponseEntity<List<InventoryResponse>> getAll() {
        return ResponseEntity.ok(inventoryService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<InventoryResponse> getById(
            @PathVariable Long id) {
        return ResponseEntity.ok(inventoryService.getById(id));
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<InventoryResponse>> getByCategory(
            @PathVariable String category) {
        return ResponseEntity.ok(
                inventoryService.getByCategory(category));
    }

    // GET /api/inventory/low-stock
    @GetMapping("/low-stock")
    public ResponseEntity<List<InventoryResponse>> getLowStock() {
        return ResponseEntity.ok(
                inventoryService.getLowStockItems());
    }

    @PutMapping("/{id}")
    public ResponseEntity<InventoryResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody InventoryRequest request) {
        return ResponseEntity.ok(
                inventoryService.update(id, request));
    }

    // PATCH /api/inventory/{id}/quantity
    @PatchMapping("/{id}/quantity")
    public ResponseEntity<InventoryResponse> updateQuantity(
            @PathVariable Long id,
            @RequestParam Double quantity) {
        return ResponseEntity.ok(
                inventoryService.updateQuantity(id, quantity));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        inventoryService.delete(id);
        return ResponseEntity.noContent().build();
    }
}