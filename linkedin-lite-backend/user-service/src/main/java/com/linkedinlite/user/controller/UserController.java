package com.linkedinlite.user.controller;

import com.linkedinlite.common.dto.ApiResponse;
import com.linkedinlite.user.constants.ApiPaths;
import com.linkedinlite.user.constants.Messages;
import com.linkedinlite.user.dto.request.UpdateUserStatusRequest;
import com.linkedinlite.user.dto.response.UserResponse;
import com.linkedinlite.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(ApiPaths.USERS_BASE)
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<UserResponse>>> list(
            @RequestParam(required = false) String q) {
        return ResponseEntity.ok(ApiResponse.ok(userService.listUsers(q)));
    }

    @GetMapping(ApiPaths.USER_BY_ID)
    public ResponseEntity<ApiResponse<UserResponse>> get(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(userService.getUser(id)));
    }

    @PatchMapping(ApiPaths.USER_STATUS)
    public ResponseEntity<ApiResponse<UserResponse>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserStatusRequest req) {
        UserResponse updated = userService.updateStatus(id, req.getStatus());
        return ResponseEntity.ok(ApiResponse.ok(updated, Messages.USER_STATUS_OK));
    }
}
