package com.linkedinlite.user.dto.response;

import com.linkedinlite.user.dto.embed.EducationDto;
import com.linkedinlite.user.dto.embed.ExperienceDto;
import com.linkedinlite.user.dto.embed.SkillDto;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class ProfileResponse {
    private final Long userId;
    private final String firstName;
    private final String lastName;
    private final String email;

    private final String headline;
    private final String about;
    private final String location;
    private final String profilePictureUrl;

    private final List<SkillDto> skills;
    private final List<EducationDto> education;
    private final List<ExperienceDto> experience;
}
