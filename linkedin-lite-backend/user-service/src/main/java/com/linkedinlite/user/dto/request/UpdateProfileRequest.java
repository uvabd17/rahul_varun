package com.linkedinlite.user.dto.request;

import com.linkedinlite.user.dto.embed.EducationDto;
import com.linkedinlite.user.dto.embed.ExperienceDto;
import com.linkedinlite.user.dto.embed.SkillDto;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class UpdateProfileRequest {

    @Size(max = 160)
    private String headline;

    @Size(max = 5000)
    private String about;

    @Size(max = 120)
    private String location;

    @Size(max = 500)
    private String profilePictureUrl;

    @Valid
    private List<SkillDto> skills;

    @Valid
    private List<EducationDto> education;

    @Valid
    private List<ExperienceDto> experience;
}
