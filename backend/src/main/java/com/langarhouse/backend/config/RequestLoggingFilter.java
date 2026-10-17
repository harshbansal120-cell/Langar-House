package com.langarhouse.backend.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

/**
 * Outermost filter — logs request metadata + correlation ID.
 * <p>
 * NEVER logs: JWT tokens, request bodies, passwords, or any sensitive data.
 * Only logs: HTTP method, path, response status, duration, IP, and request ID.
 * </p>
 * <p>
 * Generates a unique X-Request-ID per request for end-to-end tracing.
 * If the client/gateway already sends X-Request-ID, it is reused.
 * </p>
 * <p>
 * Filter order: RequestLoggingFilter → SecurityHeadersFilter → RateLimitFilter → JwtAuthFilter
 * </p>
 */
@Component
public class RequestLoggingFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(RequestLoggingFilter.class);
    private static final String REQUEST_ID_HEADER = "X-Request-ID";
    private static final String MDC_REQUEST_ID = "requestId";

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        // ── Correlation ID — reuse from gateway or generate new ──────────
        String requestId = request.getHeader(REQUEST_ID_HEADER);
        if (requestId == null || requestId.isBlank()) {
            requestId = UUID.randomUUID().toString().substring(0, 8); // short ID
        }

        // Set in MDC so ALL downstream log statements include it automatically
        MDC.put(MDC_REQUEST_ID, requestId);

        // Return the request ID to the client — useful for support tickets
        response.setHeader(REQUEST_ID_HEADER, requestId);

        long start = System.currentTimeMillis();
        String method = request.getMethod();
        String path = request.getRequestURI();
        String clientIp = resolveClientIp(request);

        try {
            filterChain.doFilter(request, response);
        } finally {
            long duration = System.currentTimeMillis() - start;
            int status = response.getStatus();

            // Log level based on status: 5xx → error, 4xx → warn, rest → info
            if (status >= 500) {
                log.error("[{}] HTTP {} {} — {} — {}ms — IP: {}",
                        requestId, method, path, status, duration, clientIp);
            } else if (status >= 400) {
                log.warn("[{}] HTTP {} {} — {} — {}ms — IP: {}",
                        requestId, method, path, status, duration, clientIp);
            } else {
                log.info("[{}] HTTP {} {} — {} — {}ms — IP: {}",
                        requestId, method, path, status, duration, clientIp);
            }

            // Clean up MDC to prevent leaking into other requests on same thread
            MDC.remove(MDC_REQUEST_ID);
        }
    }

    private String resolveClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        String realIp = request.getHeader("X-Real-IP");
        if (realIp != null && !realIp.isBlank()) {
            return realIp.trim();
        }
        return request.getRemoteAddr();
    }
}
