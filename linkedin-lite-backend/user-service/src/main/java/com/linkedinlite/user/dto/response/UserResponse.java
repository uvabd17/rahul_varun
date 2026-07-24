package com.linkedinlite.user.dto.response;

import com.linkedinlite.common.enums.UserRole;
import com.linkedinlite.user.enums.UserStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;

@Getter
@Builder
public class UserResponse {
    private final Long id;
    private final String email;
    private final String firstName;
    private final String lastName;
    private final UserRole role;
    private final UserStatus status;
    private final Instant createdAt;
}
