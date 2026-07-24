package com.linkedinlite.job.dto.request;

import com.linkedinlite.job.enums.JobType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateJobRequest {
    @NotBlank @Size(max = 200) private String title;
    @NotBlank @Size(max = 200) private String company;
              @Size(max = 200) private String location;
    @NotBlank @Size(max = 5000) private String description;
    @NotNull private JobType jobType;
}
