package com.linkedinlite.job.repository;

import com.linkedinlite.common.enums.SessionStatus;
import com.linkedinlite.job.entity.UserSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserSessionRepository extends JpaRepository<UserSession, String> {
    Optional<UserSession> findBySessionIdAndStatus(String sessionId, SessionStatus status);
}
