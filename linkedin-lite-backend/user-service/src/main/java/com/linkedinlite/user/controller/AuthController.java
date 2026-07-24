package com.linkedinlite.user.controller;

import com.linkedinlite.common.dto.ApiResponse;
import com.linkedinlite.user.constants.ApiPaths;
import com.linkedinlite.user.constants.Messages;
import com.linkedinlite.user.dto.request.LoginRequest;
import com.linkedinlite.user.dto.request.RegisterRequest;
import com.linkedinlite.user.dto.response.LoginResponse;
import com.linkedinlite.user.dto.response.UserResponse;
import com.linkedinlite.user.security.SessionHolder;
import com.linkedinlite.user.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(ApiPaths.AUTH_BASE)
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping(ApiPaths.REGISTER)
    public ResponseEntity<ApiResponse<UserResponse>> register(@Valid @RequestBody RegisterRequest req) {
        UserResponse created = authService.register(req);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(created, Messages.REGISTERED_OK));
    }

    @PostMapping(ApiPaths.LOGIN)
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest req) {
        LoginResponse res = authService.login(req);
        return ResponseEntity.ok(ApiResponse.ok(res, Messages.LOGIN_OK));
    }

    @PostMapping(ApiPaths.LOGOUT)
    public ResponseEntity<ApiResponse<Void>> logout() {
        // Filter has already validated the session — pull id from context.
        String sessionId = SessionHolder.require().getSessionId();
        authService.logout(sessionId);
        return ResponseEntity.ok(ApiResponse.ok(null, Messages.LOGOUT_OK));
    }
}
