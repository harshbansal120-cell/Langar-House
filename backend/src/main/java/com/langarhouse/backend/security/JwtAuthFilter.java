package com.langarhouse.backend.security;

import com.langarhouse.backend.profile.ProfileRepository;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.List;
import java.util.UUID;

import org.springframework.core.annotation.Order;

@Slf4j
@Component
@RequiredArgsConstructor
@Order(2)  // ADD THIS
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final ProfileRepository profileRepository;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        // 1. Extract Authorization header
        String authHeader = request.getHeader("Authorization");

        // 2. Skip if no Bearer token
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // 3. Extract token
        String token = authHeader.substring(7);

        // 4. Validate token
        if (!jwtService.isTokenValid(token)) {
            log.warn("Invalid JWT token received");
            filterChain.doFilter(request, response);
            return;
        }

        // 5. Extract user_id from token
        Claims claims = jwtService.extractAllClaims(token);
        String userId = claims.getSubject();

        // 6. Fetch role from profiles table
        String role = profileRepository.findById(UUID.fromString(userId))
                .map(profile -> profile.getRole())
                .orElse("STAFF");  // default to STAFF if no profile

        log.info("User {} authenticated with role {}", userId, role);

        // 7. Set Spring Security authentication
        String springRole = "ROLE_" + role.toUpperCase();

        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(
                        userId,
                        null,
                        List.of(new SimpleGrantedAuthority(springRole))
                );

        SecurityContextHolder.getContext()
                .setAuthentication(authentication);

        // 8. Continue
        filterChain.doFilter(request, response);
    }
}