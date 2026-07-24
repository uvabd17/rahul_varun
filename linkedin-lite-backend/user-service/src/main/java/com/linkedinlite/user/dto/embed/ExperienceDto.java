package com.linkedinlite.user.dto.embed;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExperienceDto {

    @NotBlank
    @Size(max = 120)
    private String title;

    @NotBlank
    @Size(max = 120)
    private String company;

    @Size(max = 120)
    private String location;

    private Integer startYear;
    private Integer endYear;

    // When true, endYear is ignored on display and the entry shows "Present".
    private boolean current;

    @Size(max = 2000)
    private String description;
}
