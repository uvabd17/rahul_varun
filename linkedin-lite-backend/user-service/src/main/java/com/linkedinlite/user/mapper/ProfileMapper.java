package com.linkedinlite.user.mapper;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.linkedinlite.user.dto.embed.EducationDto;
import com.linkedinlite.user.dto.embed.ExperienceDto;
import com.linkedinlite.user.dto.embed.SkillDto;
import com.linkedinlite.user.dto.response.ProfileResponse;
import com.linkedinlite.user.entity.Profile;
import com.linkedinlite.user.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;

/**
 * Converts between the JSON-string columns on Profile and typed lists in
 * DTOs. Reads default to an empty list — a malformed row shouldn't crash
 * the endpoint.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ProfileMapper {

    private static final TypeReference<List<SkillDto>>      SKILLS_TYPE      = new TypeReference<>() {};
    private static final TypeReference<List<EducationDto>>  EDUCATION_TYPE   = new TypeReference<>() {};
    private static final TypeReference<List<ExperienceDto>> EXPERIENCE_TYPE  = new TypeReference<>() {};

    private final ObjectMapper objectMapper;

    public ProfileResponse toResponse(User user, Profile profile) {
        return ProfileResponse.builder()
                .userId(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .headline(profile.getHeadline())
                .about(profile.getAbout())
                .location(profile.getLocation())
                .profilePictureUrl(profile.getProfilePictureUrl())
                .skills(readList(profile.getSkills(), SKILLS_TYPE))
                .education(readList(profile.getEducation(), EDUCATION_TYPE))
                .experience(readList(profile.getExperience(), EXPERIENCE_TYPE))
                .build();
    }

    public String writeSkills(List<SkillDto> items)         { return write(items); }
    public String writeEducation(List<EducationDto> items)  { return write(items); }
    public String writeExperience(List<ExperienceDto> items){ return write(items); }

    private <T> List<T> readList(String json, TypeReference<List<T>> type) {
        if (json == null || json.isBlank()) return Collections.emptyList();
        try {
            return objectMapper.readValue(json, type);
        } catch (JsonProcessingException ex) {
            log.warn("Bad JSON in profile column, returning empty list: {}", ex.getOriginalMessage());
            return Collections.emptyList();
        }
    }

    private String write(List<?> items) {
        if (items == null) return null;   // null → keep whatever is on the row already; caller decides
        try {
            return objectMapper.writeValueAsString(items);
        } catch (JsonProcessingException ex) {
            // Serialising a list we built ourselves shouldn't happen — fail loud if it does.
            throw new IllegalStateException("Failed to serialize profile list", ex);
        }
    }
}
