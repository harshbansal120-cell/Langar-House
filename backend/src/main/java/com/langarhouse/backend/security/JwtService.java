package com.langarhouse.backend.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.JwkSet;
import io.jsonwebtoken.security.Jwks;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.net.URL;
import java.security.Key;
import java.io.InputStream;

@Slf4j
@Service
public class JwtService {

    private final JwkSet jwkSet;

    public JwtService(
            @Value("${supabase.project.url}") String supabaseUrl) {
        try {
            String jwksUrl = supabaseUrl + "/auth/v1/.well-known/jwks.json";
            log.info("Loading JWKS from: {}", jwksUrl);
            this.jwkSet = Jwks.setParser()
                    .build()
                    .parse(new URL(jwksUrl).openStream());

            log.info("JWKS loaded successfully");
        } catch (Exception e) {
            throw new RuntimeException("Failed to load JWKS: "
                    + e.getMessage(), e);
        }
    }

    public Claims extractAllClaims(String token) {
        String kid = getKidFromToken(token);
        Key key = jwkSet.getKeys().stream()
                .filter(k -> kid.equals(k.getId()))
                .findFirst()
                .map(jwk -> (Key) jwk.toKey())
                .orElseThrow(() ->
                        new RuntimeException("No key found for kid: " + kid));

        return Jwts.parser()
                .verifyWith((java.security.PublicKey) key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private String getKidFromToken(String token) {
        String header = token.split("\\.")[0];
        byte[] decoded = java.util.Base64.getUrlDecoder().decode(header);
        String headerJson = new String(decoded);
        int kidStart = headerJson.indexOf("\"kid\":\"") + 7;
        int kidEnd = headerJson.indexOf("\"", kidStart);
        return headerJson.substring(kidStart, kidEnd);
    }

    public String extractUserId(String token) {
        return extractAllClaims(token).getSubject();
    }

    public String extractRole(String token) {
        Claims claims = extractAllClaims(token);
        Object role = claims.get("user_role");
        if (role == null) role = claims.get("role");
        return role != null ? role.toString() : null;
    }

    public boolean isTokenValid(String token) {
        try {
            extractAllClaims(token);
            return true;
        } catch (Exception e) {
            log.warn("JWT validation failed: {}", e.getMessage());
            return false;
        }
    }
}