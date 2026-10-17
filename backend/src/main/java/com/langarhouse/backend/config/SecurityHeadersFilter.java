package com.langarhouse.backend.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Adds production security headers to every response.
 * Filter order: RequestLoggingFilter → SecurityHeadersFilter → RateLimitFilter → JwtAuthFilter
 */
@Component
public class SecurityHeadersFilter extends OncePerRequestFilter {

    @Value("${security.headers.hsts:false}")
    private boolean hstsEnabled;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        // ── Prevent MIME-sniffing ────────────────────────────────────────────
        response.setHeader("X-Content-Type-Options", "nosniff");

        // ── Prevent clickjacking ─────────────────────────────────────────────
        response.setHeader("X-Frame-Options", "DENY");

        // ── HSTS — only in prod (HTTPS) to avoid confusing localhost ─────────
        if (hstsEnabled) {
            response.setHeader("Strict-Transport-Security",
                    "max-age=31536000; includeSubDomains");
        }

        // ── Referrer policy — limit info leaked to other origins ─────────────
        response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

        // ── Disable unnecessary browser features ─────────────────────────────
        response.setHeader("Permissions-Policy",
                "geolocation=(), microphone=(), camera=()");

        // ── XSS protection (deprecated but harmless to include) ──────────────
        response.setHeader("X-XSS-Protection", "1; mode=block");

        // ── CSP — restrict resource loading + prevent injection vectors ──────
        response.setHeader("Content-Security-Policy",
                "default-src 'self'; frame-ancestors 'none'; base-uri 'self'");

        // ── Cache-Control — prevent caching of API responses ─────────────────
        String path = request.getRequestURI();
        if (path.startsWith("/api/")) {
            response.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
            response.setHeader("Pragma", "no-cache");
        }

        // ── Remove server fingerprint ────────────────────────────────────────
        response.setHeader("Server", "");

        filterChain.doFilter(request, response);
    }
}
