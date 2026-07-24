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
public class EducationDto {

    @NotBlank
    @Size(max = 120)
    private String school;

    @Size(max = 120)
    private String degree;

    @Size(max = 120)
    private String field;

    // Years kept simple — integers. Frontend enforces sane ranges.
    private Integer startYear;
    private Integer endYear;
}
