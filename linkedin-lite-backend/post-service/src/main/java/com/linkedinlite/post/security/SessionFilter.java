package com.linkedinlite.post.security;

import com.linkedinlite.common.constants.HttpHeaders;
import com.linkedinlite.common.dto.SessionContext;
import com.linkedinlite.common.enums.SessionStatus;
import com.linkedinlite.post.entity.User;
import com.linkedinlite.post.entity.UserSession;
import com.linkedinlite.post.repository.UserRepository;
import com.linkedinlite.post.repository.UserSessionRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Set;

/**
 * Two-lookup filter: session → user, then populates the SessionContext
 * with userId + role. Read-only against tables owned by user-service.
 */
@Component
@RequiredArgsConstructor
public class SessionFilter extends OncePerRequestFilter {

    private static final Set<String> PUBLIC_PREFIXES = Set.of(
            "/swagger-ui", "/v3/api-docs", "/actuator"
    );

    private final UserSessionRepository sessionRepo;
    private final UserRepository userRepo;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest req) {
        String p = req.getRequestURI();
        return PUBLIC_PREFIXES.stream().anyMatch(p::startsWith);
    }

    @Override
    protected void doFilterInternal(HttpServletRequest req,
                                    HttpServletResponse res,
                                    FilterChain chain) throws ServletException, IOException {
        try {
            String sid = req.getHeader(HttpHeaders.SESSION_ID);
            if (sid != null && !sid.isBlank()) {
                sessionRepo.findBySessionIdAndStatus(sid, SessionStatus.ACTIVE)
                        .flatMap(s -> userRepo.findById(s.getUserId())
                                .map(u -> build(sid, s, u)))
                        .ifPresent(SessionHolder::set);
            }
            chain.doFilter(req, res);
        } finally {
            SessionHolder.clear();
        }
    }

    private SessionContext build(String sid, UserSession s, User u) {
        return SessionContext.builder()
                .sessionId(sid)
                .userId(s.getUserId())
                .role(u.getRole())
                .build();
    }
}
