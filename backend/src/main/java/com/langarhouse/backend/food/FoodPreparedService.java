package com.langarhouse.backend.food;

import com.langarhouse.backend.food.dto.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class FoodPreparedService {

    private final FoodPreparedRepository foodPreparedRepository;

    // ── CREATE ────────────────────────────────────────────
    public FoodPreparedResponse create(FoodPreparedRequest request) {

        // Business rule: wasted cannot exceed prepared
        validateWaste(request.getQuantityPrepared(),
                request.getQuantityWasted());

        log.info("Creating food record: {} for date: {}",
                request.getDishName(), request.getDate());

        FoodPrepared entity = toEntity(request);
        FoodPrepared saved = foodPreparedRepository.save(entity);
        return toResponse(saved);
    }

    // ── GET ALL ───────────────────────────────────────────
    public List<FoodPreparedResponse> getAll() {
        return foodPreparedRepository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ── GET BY DATE ───────────────────────────────────────
    public List<FoodPreparedResponse> getByDate(LocalDate date) {
        return foodPreparedRepository.findByDate(date)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ── GET BY ID ─────────────────────────────────────────
    public FoodPreparedResponse getById(Long id) {
        FoodPrepared entity = foodPreparedRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(
                        "Food record not found with id: " + id));
        return toResponse(entity);
    }

    // ── UPDATE ────────────────────────────────────────────
    public FoodPreparedResponse update(
            Long id, FoodPreparedRequest request) {

        validateWaste(request.getQuantityPrepared(),
                request.getQuantityWasted());

        FoodPrepared existing = foodPreparedRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(
                        "Food record not found with id: " + id));

        existing.setDate(request.getDate());
        existing.setMealType(request.getMealType());
        existing.setDishName(request.getDishName());
        existing.setQuantityPrepared(request.getQuantityPrepared());
        existing.setQuantityWasted(request.getQuantityWasted());
        existing.setUnit(request.getUnit());

        return toResponse(foodPreparedRepository.save(existing));
    }

    // ── DELETE ────────────────────────────────────────────
    public void delete(Long id) {
        if (!foodPreparedRepository.existsById(id)) {
            throw new RuntimeException(
                    "Food record not found with id: " + id);
        }
        foodPreparedRepository.deleteById(id);
    }

    // ── VALIDATION ────────────────────────────────────────
    private void validateWaste(
            Double prepared, Double wasted) {
        if (wasted > prepared) {
            throw new IllegalArgumentException(
                    "Quantity wasted (" + wasted +
                            ") cannot exceed quantity prepared (" +
                            prepared + ")");
        }
    }

    // ── COMPUTED FIELDS ───────────────────────────────────
    private Double computeConsumed(
            Double prepared, Double wasted) {
        return prepared - wasted;
    }

    private Double computeEfficiency(
            Double prepared, Double wasted) {
        if (prepared == 0) return 0.0;
        double consumed = prepared - wasted;
        return Math.round((consumed / prepared) * 10000.0)
                / 100.0; // rounds to 2 decimal places
    }

    // ── MAPPERS ───────────────────────────────────────────
    private FoodPrepared toEntity(FoodPreparedRequest request) {
        return FoodPrepared.builder()
                .date(request.getDate())
                .mealType(request.getMealType())
                .dishName(request.getDishName())
                .quantityPrepared(request.getQuantityPrepared())
                .quantityWasted(request.getQuantityWasted())
                .unit(request.getUnit() != null
                        ? request.getUnit() : "kg")
                .build();
    }

    private FoodPreparedResponse toResponse(FoodPrepared entity) {
        return FoodPreparedResponse.builder()
                .id(entity.getId())
                .date(entity.getDate())
                .mealType(entity.getMealType())
                .dishName(entity.getDishName())
                .quantityPrepared(entity.getQuantityPrepared())
                .quantityWasted(entity.getQuantityWasted())
                .quantityConsumed(computeConsumed(
                        entity.getQuantityPrepared(),
                        entity.getQuantityWasted()))
                .efficiencyPercent(computeEfficiency(
                        entity.getQuantityPrepared(),
                        entity.getQuantityWasted()))
                .unit(entity.getUnit())
                .build();
    }
}