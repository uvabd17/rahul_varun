package com.linkedinlite.user.controller;

import com.linkedinlite.common.dto.ApiResponse;
import com.linkedinlite.user.constants.ApiPaths;
import com.linkedinlite.user.constants.Messages;
import com.linkedinlite.user.dto.request.UpdateProfilePictureRequest;
import com.linkedinlite.user.dto.request.UpdateProfileRequest;
import com.linkedinlite.user.dto.response.ProfileResponse;
import com.linkedinlite.user.service.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(ApiPaths.PROFILE_BASE)
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<ProfileResponse>> me() {
        return ResponseEntity.ok(ApiResponse.ok(profileService.getMyProfile()));
    }

    @GetMapping(ApiPaths.PROFILE_BY_ID)
    public ResponseEntity<ApiResponse<ProfileResponse>> get(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(profileService.getProfile(id)));
    }

    @PutMapping(ApiPaths.PROFILE_BY_ID)
    public ResponseEntity<ApiResponse<ProfileResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateProfileRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(profileService.updateProfile(id, req), Messages.PROFILE_UPDATED));
    }

    @PostMapping("/{id}/picture")
    public ResponseEntity<ApiResponse<ProfileResponse>> updatePicture(
            @PathVariable Long id,
            @Valid @RequestBody UpdateProfilePictureRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(profileService.updatePicture(id, req), Messages.PICTURE_UPDATED));
    }
}
