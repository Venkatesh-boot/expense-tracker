package com.hamsacorp.expense.config;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Bucket4j;
import io.github.bucket4j.Refill;
import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class RateLimitingFilter implements Filter {
    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();
    private static final int REQUESTS_PER_MINUTE = 60; // Customize as needed

    private Bucket resolveBucket(String key) {
        return buckets.computeIfAbsent(key, k -> Bucket4j.builder()
                .addLimit(Bandwidth.classic(REQUESTS_PER_MINUTE, Refill.greedy(REQUESTS_PER_MINUTE, Duration.ofMinutes(1))))
                .build());
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        String key = getKey(httpRequest);
        Bucket bucket = resolveBucket(key);
        if (bucket.tryConsume(1)) {
            chain.doFilter(request, response);
        } else {
            httpResponse.setStatus(429);
            httpResponse.getWriter().write("Too Many Requests");
        }
    }

    private String getKey(HttpServletRequest request) {
        // Use user email from JWT if available, else fallback to IP
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            // Optionally, parse JWT to extract email for per-user limiting
            // For now, use the token itself as key
            return authHeader;
        }
        return request.getRemoteAddr();
    }
}
