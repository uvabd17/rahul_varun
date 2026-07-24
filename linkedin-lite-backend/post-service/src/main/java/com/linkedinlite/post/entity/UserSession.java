package com.linkedinlite.post.entity;

import com.linkedinlite.common.enums.SessionStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * Read-only view of user_sessions used only for header auth.
 * user-service owns writes to this table.
 */
@Entity
@Table(name = "user_sessions")
@Getter
@NoArgsConstructor
public class UserSession {

    @Id
    @Column(name = "session_id")
    private String sessionId;

    @Column(name = "user_id")
    private Long userId;

    @Enumerated(EnumType.STRING)
    private SessionStatus status;
}
