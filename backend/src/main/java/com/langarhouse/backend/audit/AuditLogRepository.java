package com.langarhouse.backend.audit;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    // All actions by a specific user
    List<AuditLog> findByUserIdOrderByCreatedAtDesc(String userId);

    // All actions on a module (e.g. "FOOD")
    List<AuditLog> findByModuleOrderByCreatedAtDesc(String module);

    // Time-range query — useful for daily reports
    List<AuditLog> findByCreatedAtBetweenOrderByCreatedAtDesc(Instant from, Instant to);

    // Paginated full log for admin dashboard
    Page<AuditLog> findAllByOrderByCreatedAtDesc(Pageable pageable);
}