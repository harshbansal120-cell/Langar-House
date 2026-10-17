package com.langarhouse.backend.audit;

import jakarta.servlet.http.HttpServletRequest;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.lang.annotation.Annotation;
import java.lang.reflect.Method;
import java.util.Arrays;

@Aspect
@Component
public class AuditAspect {

    private static final Logger log = LoggerFactory.getLogger(AuditAspect.class);

    private final AuditLogService auditLogService;

    public AuditAspect(AuditLogService auditLogService) {
        this.auditLogService = auditLogService;
    }

    /**
     * Intercepts ALL methods in any @RestController under our api package.
     * We then filter to only write operations inside the method.
     */
    @Around("within(@org.springframework.web.bind.annotation.RestController *)" +
            " && execution(* com.langarhouse.backend..*Controller.*(..))")
    public Object auditControllerMethod(ProceedingJoinPoint joinPoint) throws Throwable {

        HttpServletRequest request = resolveRequest();
        String httpMethod = request != null ? request.getMethod() : "UNKNOWN";

        // Only audit write operations — GET/HEAD/OPTIONS are not logged
        if (!isWriteOperation(httpMethod)) {
            return joinPoint.proceed();
        }

        // Extract context before proceeding
        String userId    = resolveUserId();
        String userRole  = resolveUserRole();
        String module    = resolveModule(joinPoint);
        String action    = resolveAction(httpMethod, joinPoint);
        String ipAddress = request != null ? resolveClientIp(request) : "unknown";
        String entityId  = resolveEntityId(joinPoint);

        Object result;
        String status = "SUCCESS";

        try {
            result = joinPoint.proceed();   // ← execute the real controller method

            // Try to capture the returned entity ID for CREATE operations
            if ("CREATE".equals(action) && result instanceof ResponseEntity<?> re
                    && re.getBody() != null) {
                entityId = extractIdFromResponse(re.getBody(), entityId);
            }

        } catch (Throwable ex) {
            status = "FAILURE";
            // Record failure then rethrow — global exception handler still runs
            recordAudit(userId, userRole, action, module, entityId,
                    buildDescription(action, module, entityId, httpMethod),
                    ipAddress, status);
            throw ex;
        }

        recordAudit(userId, userRole, action, module, entityId,
                buildDescription(action, module, entityId, httpMethod),
                ipAddress, status);

        return result;
    }

    // ── Resolution Helpers ────────────────────────────────────────────────────

    private void recordAudit(String userId, String userRole, String action,
                             String module, String entityId, String description,
                             String ipAddress, String status) {
        auditLogService.record(
                AuditLog.builder()
                        .userId(userId)
                        .userRole(userRole)
                        .action(action)
                        .module(module)
                        .entityId(entityId)
                        .description(description)
                        .ipAddress(ipAddress)
                        .status(status)
                        .build()
        );
    }

    /**
     * Maps HTTP method + controller method name to a semantic action.
     */
    private String resolveAction(String httpMethod, ProceedingJoinPoint joinPoint) {
        String methodName = joinPoint.getSignature().getName().toLowerCase();
        return switch (httpMethod) {
            case "POST"   -> "CREATE";
            case "PUT"    -> "UPDATE";
            case "DELETE" -> "DELETE";
            case "PATCH"  -> methodName.contains("quantity") ? "PATCH_QUANTITY" : "PATCH";
            default       -> "WRITE";
        };
    }

    /**
     * Derives module name from the controller class name.
     * e.g. VisitorController → VISITOR, FoodController → FOOD
     */
    private String resolveModule(ProceedingJoinPoint joinPoint) {
        String className = joinPoint.getTarget().getClass().getSimpleName();
        return className
                .replace("Controller", "")
                .replace("Prepared", "_PREPARED")   // FoodPrepared → FOOD_PREPARED
                .toUpperCase();
    }

    /**
     * Extracts path variable {id} from method arguments when it's a Long.
     * Covers PUT /api/food/{id} and DELETE /api/food/{id} naturally.
     */
    private String resolveEntityId(ProceedingJoinPoint joinPoint) {
        Object[] args = joinPoint.getArgs();
        if (args == null) return null;

        MethodSignature sig = (MethodSignature) joinPoint.getSignature();
        Method method = sig.getMethod();
        Annotation[][] paramAnnotations = method.getParameterAnnotations();

        for (int i = 0; i < paramAnnotations.length; i++) {
            for (Annotation ann : paramAnnotations[i]) {
                if (ann instanceof PathVariable && args[i] != null) {
                    return String.valueOf(args[i]);
                }
            }
        }
        return null;   // POST (create) — ID not known until after save
    }

    /**
     * After a successful CREATE, the response body often has an `id` field.
     * We try to extract it reflectively so we can store it in audit_logs.
     */
    private String extractIdFromResponse(Object body, String fallback) {
        try {
            var idMethod = body.getClass().getMethod("getId");
            Object id = idMethod.invoke(body);
            return id != null ? String.valueOf(id) : fallback;
        } catch (Exception e) {
            return fallback;  // DTO doesn't expose getId() — no problem
        }
    }

    private String buildDescription(String action, String module,
                                    String entityId, String httpMethod) {
        String target = entityId != null ? module + "#" + entityId : module;
        return action + " on " + target + " via " + httpMethod;
    }

    private String resolveUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return (auth != null && auth.isAuthenticated()) ? auth.getName() : "anonymous";
    }

    private String resolveUserRole() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return "UNKNOWN";
        return auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .findFirst()
                .orElse("UNKNOWN")
                .replace("ROLE_", "");
    }

    private HttpServletRequest resolveRequest() {
        try {
            ServletRequestAttributes attrs =
                    (ServletRequestAttributes) RequestContextHolder.currentRequestAttributes();
            return attrs.getRequest();
        } catch (IllegalStateException e) {
            return null;
        }
    }

    private String resolveClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private boolean isWriteOperation(String method) {
        return switch (method) {
            case "POST", "PUT", "DELETE", "PATCH" -> true;
            default -> false;
        };
    }
}