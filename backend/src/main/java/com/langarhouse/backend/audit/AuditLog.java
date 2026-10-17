package com.langarhouse.backend.audit;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "audit_logs")
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(name = "user_role", nullable = false)
    private String userRole;

    @Column(name = "action", nullable = false)
    private String action;           // CREATE / UPDATE / DELETE / PATCH

    @Column(name = "module", nullable = false)
    private String module;           // VISITOR / FOOD / INVENTORY / EXPENSE / ATTENDANCE

    @Column(name = "entity_id")
    private String entityId;

    @Column(name = "description")
    private String description;

    @Column(name = "ip_address")
    private String ipAddress;

    @Column(name = "status", nullable = false)
    private String status;           // SUCCESS / FAILURE

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    // ── Constructors ──────────────────────────────────────────────────────────

    public AuditLog() {}

    private AuditLog(Builder builder) {
        this.userId      = builder.userId;
        this.userRole    = builder.userRole;
        this.action      = builder.action;
        this.module      = builder.module;
        this.entityId    = builder.entityId;
        this.description = builder.description;
        this.ipAddress   = builder.ipAddress;
        this.status      = builder.status;
        this.createdAt   = Instant.now();
    }

    // ── Builder ───────────────────────────────────────────────────────────────

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String userId, userRole, action, module;
        private String entityId, description, ipAddress;
        private String status = "SUCCESS";

        public Builder userId(String v)      { this.userId      = v; return this; }
        public Builder userRole(String v)    { this.userRole    = v; return this; }
        public Builder action(String v)      { this.action      = v; return this; }
        public Builder module(String v)      { this.module      = v; return this; }
        public Builder entityId(String v)    { this.entityId    = v; return this; }
        public Builder description(String v) { this.description = v; return this; }
        public Builder ipAddress(String v)   { this.ipAddress   = v; return this; }
        public Builder status(String v)      { this.status      = v; return this; }
        public AuditLog build()              { return new AuditLog(this); }
    }

    // ── Getters ───────────────────────────────────────────────────────────────

    public Long getId()          { return id; }
    public String getUserId()    { return userId; }
    public String getUserRole()  { return userRole; }
    public String getAction()    { return action; }
    public String getModule()    { return module; }
    public String getEntityId()  { return entityId; }
    public String getDescription(){ return description; }
    public String getIpAddress() { return ipAddress; }
    public String getStatus()    { return status; }
    public Instant getCreatedAt(){ return createdAt; }
}