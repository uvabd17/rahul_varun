package com.linkedinlite.user.service;

import com.linkedinlite.user.dto.request.UpdateProfilePictureRequest;
import com.linkedinlite.user.dto.request.UpdateProfileRequest;
import com.linkedinlite.user.dto.response.ProfileResponse;

public interface ProfileService {

    ProfileResponse getMyProfile();

    ProfileResponse getProfile(Long userId);

    ProfileResponse updateProfile(Long userId, UpdateProfileRequest request);

    ProfileResponse updatePicture(Long userId, UpdateProfilePictureRequest request);
}
