package com.linkedinlite.user.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class LoginResponse {
    private final String sessionId;
    private final UserResponse user;
}
