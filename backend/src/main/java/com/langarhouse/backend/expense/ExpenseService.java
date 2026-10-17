package com.langarhouse.backend.expense;

import com.langarhouse.backend.expense.dto.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseRepository expenseRepository;

    // ── CREATE ────────────────────────────────────────────
    public ExpenseResponse create(ExpenseRequest request) {
        log.info("Creating expense: {} on {}",
                request.getItemName(), request.getDate());

        // Compute total
        double total = request.getQuantity() * request.getPrice();

        Expense entity = toEntity(request, total);
        return toResponse(expenseRepository.save(entity));
    }

    // ── GET ALL ───────────────────────────────────────────
    public List<ExpenseResponse> getAll() {
        return expenseRepository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ── GET BY ID ─────────────────────────────────────────
    public ExpenseResponse getById(Long id) {
        return toResponse(expenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(
                        "Expense not found with id: " + id)));
    }

    // ── GET BY DATE ───────────────────────────────────────
    public List<ExpenseResponse> getByDate(LocalDate date) {
        return expenseRepository.findByDate(date)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ── GET BY CATEGORY ───────────────────────────────────
    public List<ExpenseResponse> getByCategory(String category) {
        return expenseRepository.findByCategory(category)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ── GET TOTAL BY DATE ─────────────────────────────────
    public Double getTotalByDate(LocalDate date) {
        Double total = expenseRepository.sumTotalByDate(date);
        return total != null ? total : 0.0;
    }

    // ── UPDATE ────────────────────────────────────────────
    public ExpenseResponse update(
            Long id, ExpenseRequest request) {
        Expense existing = expenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(
                        "Expense not found with id: " + id));

        double total = request.getQuantity() * request.getPrice();

        existing.setDate(request.getDate());
        existing.setItemName(request.getItemName());
        existing.setCategory(request.getCategory());
        existing.setQuantity(request.getQuantity());
        existing.setUnit(request.getUnit());
        existing.setPrice(request.getPrice());
        existing.setTotal(total);

        return toResponse(expenseRepository.save(existing));
    }

    // ── DELETE ────────────────────────────────────────────
    public void delete(Long id) {
        if (!expenseRepository.existsById(id)) {
            throw new RuntimeException(
                    "Expense not found with id: " + id);
        }
        expenseRepository.deleteById(id);
    }

    // ── MAPPERS ───────────────────────────────────────────
    private Expense toEntity(
            ExpenseRequest request, double total) {
        return Expense.builder()
                .date(request.getDate())
                .itemName(request.getItemName())
                .category(request.getCategory())
                .quantity(request.getQuantity())
                .unit(request.getUnit())
                .price(request.getPrice())
                .total(total)
                .build();
    }

    private ExpenseResponse toResponse(Expense entity) {
        return ExpenseResponse.builder()
                .id(entity.getId())
                .date(entity.getDate())
                .itemName(entity.getItemName())
                .category(entity.getCategory())
                .quantity(entity.getQuantity())
                .unit(entity.getUnit())
                .price(entity.getPrice())
                .total(entity.getTotal())
                .build();
    }
}