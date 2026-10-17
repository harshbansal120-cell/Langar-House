package com.langarhouse.backend.inventory;

import com.langarhouse.backend.inventory.dto.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class InventoryService {

    private final InventoryRepository inventoryRepository;

    // ── CREATE ────────────────────────────────────────────
    public InventoryResponse create(InventoryRequest request) {
        log.info("Creating inventory item: {}", request.getItemName());
        InventoryItem entity = toEntity(request);
        return toResponse(inventoryRepository.save(entity));
    }

    // ── GET ALL ───────────────────────────────────────────
    public List<InventoryResponse> getAll() {
        return inventoryRepository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ── GET BY ID ─────────────────────────────────────────
    public InventoryResponse getById(Long id) {
        return toResponse(inventoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(
                        "Item not found with id: " + id)));
    }

    // ── GET BY CATEGORY ───────────────────────────────────
    public List<InventoryResponse> getByCategory(String category) {
        return inventoryRepository.findByCategory(category)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ── GET LOW STOCK ─────────────────────────────────────
    public List<InventoryResponse> getLowStockItems() {
        log.info("Fetching low stock items");
        return inventoryRepository.findAll()
                .stream()
                .filter(item -> item.getQuantity()
                        <= item.getThreshold())
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ── UPDATE ────────────────────────────────────────────
    public InventoryResponse update(
            Long id, InventoryRequest request) {
        InventoryItem existing = inventoryRepository
                .findById(id)
                .orElseThrow(() -> new RuntimeException(
                        "Item not found with id: " + id));

        existing.setItemName(request.getItemName());
        existing.setCategory(request.getCategory());
        existing.setQuantity(request.getQuantity());
        existing.setUnit(request.getUnit());
        existing.setThreshold(request.getThreshold());

        return toResponse(inventoryRepository.save(existing));
    }

    // ── UPDATE QUANTITY ONLY ──────────────────────────────
    public InventoryResponse updateQuantity(
            Long id, Double quantity) {
        InventoryItem existing = inventoryRepository
                .findById(id)
                .orElseThrow(() -> new RuntimeException(
                        "Item not found with id: " + id));

        existing.setQuantity(quantity);
        InventoryResponse response = toResponse(
                inventoryRepository.save(existing));

        if (response.getIsLowStock()) {
            log.warn("LOW STOCK ALERT: {} has only {} {} remaining",
                    existing.getItemName(),
                    quantity,
                    existing.getUnit());
        }

        return response;
    }

    // ── DELETE ────────────────────────────────────────────
    public void delete(Long id) {
        if (!inventoryRepository.existsById(id)) {
            throw new RuntimeException(
                    "Item not found with id: " + id);
        }
        inventoryRepository.deleteById(id);
    }

    // ── MAPPERS ───────────────────────────────────────────
    private InventoryItem toEntity(InventoryRequest request) {
        return InventoryItem.builder()
                .itemName(request.getItemName())
                .category(request.getCategory())
                .quantity(request.getQuantity())
                .unit(request.getUnit())
                .threshold(request.getThreshold())
                .build();
    }

    private InventoryResponse toResponse(InventoryItem entity) {
        return InventoryResponse.builder()
                .id(entity.getId())
                .itemName(entity.getItemName())
                .category(entity.getCategory())
                .quantity(entity.getQuantity())
                .unit(entity.getUnit())
                .threshold(entity.getThreshold())
                .isLowStock(entity.getQuantity()
                        <= entity.getThreshold())
                .build();
    }
}