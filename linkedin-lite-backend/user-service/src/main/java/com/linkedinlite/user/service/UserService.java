package com.linkedinlite.user.service;

import com.linkedinlite.user.dto.response.UserResponse;
import com.linkedinlite.user.enums.UserStatus;

import java.util.List;

public interface UserService {

    List<UserResponse> listUsers(String query);

    UserResponse getUser(Long id);

    UserResponse updateStatus(Long id, UserStatus status);
}
