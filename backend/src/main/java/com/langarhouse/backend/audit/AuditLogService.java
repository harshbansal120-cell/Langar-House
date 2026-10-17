package com.langarhouse.backend.audit;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class AuditLogService {

    private static final Logger log = LoggerFactory.getLogger(AuditLogService.class);

    private final AuditLogRepository repository;

    public AuditLogService(AuditLogRepository repository) {
        this.repository = repository;
    }

    /**
     * Persists an audit entry asynchronously.
     * The @Async annotation means this runs in a separate thread —
     * the HTTP response is returned to the client WITHOUT waiting for DB write.
     */
    @Async
    public void record(AuditLog auditLog) {
        try {
            repository.save(auditLog);
            log.debug("Audit recorded — user: {}, action: {}, module: {}, entity: {}",
                    auditLog.getUserId(),
                    auditLog.getAction(),
                    auditLog.getModule(),
                    auditLog.getEntityId());
        } catch (Exception ex) {
            // Audit failure must NEVER crash the main request
            log.error("Failed to persist audit log — user: {}, action: {}, error: {}",
                    auditLog.getUserId(), auditLog.getAction(), ex.getMessage());
        }
    }
}