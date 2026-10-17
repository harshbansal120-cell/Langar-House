package com.langarhouse.backend.inventory;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface InventoryRepository
        extends JpaRepository<InventoryItem, Long> {

    List<InventoryItem> findByCategory(String category);

    // Items where quantity is at or below threshold
    @Query("SELECT i FROM InventoryItem i WHERE i.quantity <= i.threshold")
    List<InventoryItem> findLowStockItems();
}