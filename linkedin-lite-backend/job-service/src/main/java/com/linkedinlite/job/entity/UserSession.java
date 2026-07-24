package com.linkedinlite.job.entity;

import com.linkedinlite.common.enums.SessionStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "user_sessions")
@Getter
@NoArgsConstructor
public class UserSession {
    @Id
    @Column(name = "session_id")
    private String sessionId;
    @Column(name = "user_id") private Long userId;
    @Enumerated(EnumType.STRING) private SessionStatus status;
}
