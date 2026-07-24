package com.linkedinlite.user.security;

import com.linkedinlite.common.constants.HttpHeaders;
import com.linkedinlite.common.dto.SessionContext;
import com.linkedinlite.common.enums.SessionStatus;
import com.linkedinlite.user.entity.User;
import com.linkedinlite.user.entity.UserSession;
import com.linkedinlite.user.enums.UserStatus;
import com.linkedinlite.user.repository.UserRepository;
import com.linkedinlite.user.repository.UserSessionRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Optional;
import java.util.Set;

/**
 * Reads X-Session-Id, resolves the user, and stashes context in
 * {@link SessionHolder}. Public paths (register, login, swagger)
 * skip the check so unauthenticated callers can reach them.
 */
@Component
@RequiredArgsConstructor
public class SessionFilter extends OncePerRequestFilter {

    private static final Set<String> PUBLIC_PREFIXES = Set.of(
            "/auth/register",
            "/auth/login",
            "/swagger-ui",
            "/v3/api-docs",
            "/actuator"
    );

    private final UserSessionRepository sessionRepo;
    private final UserRepository userRepo;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return PUBLIC_PREFIXES.stream().anyMatch(path::startsWith);
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        try {
            String sessionId = request.getHeader(HttpHeaders.SESSION_ID);
            if (sessionId != null && !sessionId.isBlank()) {
                Optional<UserSession> maybe = sessionRepo.findBySessionIdAndStatus(sessionId, SessionStatus.ACTIVE);
                // Skip: only ACTIVE sessions belonging to ACTIVE users pass through.
                maybe.flatMap(s -> userRepo.findById(s.getUserId()))
                        .filter(u -> u.getStatus() == UserStatus.ACTIVE)
                        .ifPresent(u -> SessionHolder.set(build(sessionId, u)));
            }
            chain.doFilter(request, response);
        } finally {
            SessionHolder.clear();
        }
    }

    private SessionContext build(String sessionId, User u) {
        return SessionContext.builder()
                .sessionId(sessionId)
                .userId(u.getId())
                .role(u.getRole())
                .build();
    }
}
