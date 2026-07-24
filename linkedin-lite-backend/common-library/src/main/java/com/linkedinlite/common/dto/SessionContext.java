package com.linkedinlite.common.dto;

import com.linkedinlite.common.enums.UserRole;
import lombok.Builder;
import lombok.Getter;

/**
 * Resolved identity of the current request. The SessionFilter builds this
 * from the X-Session-Id header and stashes it in a ThreadLocal so any
 * service-layer code can read who is acting without touching the request.
 */
@Getter
@Builder
public class SessionContext {
    private final String sessionId;
    private final Long userId;
    private final UserRole role;
}
