package com.linkedinlite.job.dto.request;

import com.linkedinlite.job.enums.JobStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateJobStatusRequest {
    @NotNull private JobStatus status;
}
