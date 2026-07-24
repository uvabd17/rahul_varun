package com.linkedinlite.user.service;

import com.linkedinlite.user.dto.request.LoginRequest;
import com.linkedinlite.user.dto.request.RegisterRequest;
import com.linkedinlite.user.dto.response.LoginResponse;
import com.linkedinlite.user.dto.response.UserResponse;

public interface AuthService {

    UserResponse register(RegisterRequest request);

    LoginResponse login(LoginRequest request);

    void logout(String sessionId);
}
