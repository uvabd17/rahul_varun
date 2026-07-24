package com.linkedinlite.user.service.impl;

import com.linkedinlite.common.enums.UserRole;
import com.linkedinlite.user.constants.Messages;
import com.linkedinlite.user.dto.request.UpdateProfilePictureRequest;
import com.linkedinlite.user.dto.request.UpdateProfileRequest;
import com.linkedinlite.user.dto.response.ProfileResponse;
import com.linkedinlite.user.entity.Profile;
import com.linkedinlite.user.entity.User;
import com.linkedinlite.user.exception.ForbiddenException;
import com.linkedinlite.user.exception.ResourceNotFoundException;
import com.linkedinlite.user.mapper.ProfileMapper;
import com.linkedinlite.user.repository.ProfileRepository;
import com.linkedinlite.user.repository.UserRepository;
import com.linkedinlite.user.security.SessionHolder;
import com.linkedinlite.user.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProfileServiceImpl implements ProfileService {

    private final UserRepository userRepo;
    private final ProfileRepository profileRepo;
    private final ProfileMapper profileMapper;

    @Override
    @Transactional(readOnly = true)
    public ProfileResponse getMyProfile() {
        return getProfile(SessionHolder.require().getUserId());
    }

    @Override
    @Transactional(readOnly = true)
    public ProfileResponse getProfile(Long userId) {
        SessionHolder.require();
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(Messages.USER_NOT_FOUND));
        Profile profile = profileRepo.findByUserId(userId).orElseGet(() -> emptyFor(userId));
        return profileMapper.toResponse(user, profile);
    }

    @Override
    @Transactional
    public ProfileResponse updateProfile(Long userId, UpdateProfileRequest req) {
        requireOwnerOrAdmin(userId);

        User user = userRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(Messages.USER_NOT_FOUND));
        Profile profile = profileRepo.findByUserId(userId)
                .orElseGet(() -> profileRepo.save(emptyFor(userId)));

        // Only overwrite what was sent — null leaves the existing value alone.
        if (req.getHeadline()          != null) profile.setHeadline(req.getHeadline());
        if (req.getAbout()             != null) profile.setAbout(req.getAbout());
        if (req.getLocation()          != null) profile.setLocation(req.getLocation());
        if (req.getProfilePictureUrl() != null) profile.setProfilePictureUrl(req.getProfilePictureUrl());
        if (req.getSkills()            != null) profile.setSkills(profileMapper.writeSkills(req.getSkills()));
        if (req.getEducation()         != null) profile.setEducation(profileMapper.writeEducation(req.getEducation()));
        if (req.getExperience()        != null) profile.setExperience(profileMapper.writeExperience(req.getExperience()));

        Profile saved = profileRepo.save(profile);
        return profileMapper.toResponse(user, saved);
    }

    @Override
    @Transactional
    public ProfileResponse updatePicture(Long userId, UpdateProfilePictureRequest req) {
        requireOwnerOrAdmin(userId);

        User user = userRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(Messages.USER_NOT_FOUND));
        Profile profile = profileRepo.findByUserId(userId)
                .orElseGet(() -> profileRepo.save(emptyFor(userId)));

        profile.setProfilePictureUrl(req.getUrl());
        Profile saved = profileRepo.save(profile);
        return profileMapper.toResponse(user, saved);
    }

    private Profile emptyFor(Long userId) {
        return Profile.builder().userId(userId).build();
    }

    // Owner or admin can write. Anyone else is forbidden.
    private void requireOwnerOrAdmin(Long targetUserId) {
        var ctx = SessionHolder.require();
        if (!targetUserId.equals(ctx.getUserId()) && ctx.getRole() != UserRole.ADMIN) {
            throw new ForbiddenException(Messages.NOT_PROFILE_OWNER);
        }
    }
}
