package com.langarhouse.backend.food;

import com.langarhouse.backend.food.dto.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/food")
@RequiredArgsConstructor
public class FoodPreparedController {

    private final FoodPreparedService foodPreparedService;

    @PostMapping
    public ResponseEntity<FoodPreparedResponse> create(
            @Valid @RequestBody FoodPreparedRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(foodPreparedService.create(request));
    }

    @GetMapping
    public ResponseEntity<List<FoodPreparedResponse>> getAll() {
        return ResponseEntity.ok(foodPreparedService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<FoodPreparedResponse> getById(
            @PathVariable Long id) {
        return ResponseEntity.ok(foodPreparedService.getById(id));
    }

    @GetMapping("/by-date")
    public ResponseEntity<List<FoodPreparedResponse>> getByDate(
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate date) {
        return ResponseEntity.ok(
                foodPreparedService.getByDate(date));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FoodPreparedResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody FoodPreparedRequest request) {
        return ResponseEntity.ok(
                foodPreparedService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        foodPreparedService.delete(id);
        return ResponseEntity.noContent().build();
    }
}