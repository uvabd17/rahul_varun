package com.linkedinlite.job.dto.response;

import com.linkedinlite.job.enums.ApplicationStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;

@Getter
@Builder
public class JobApplicationResponse {
    private final Long id;
    private final Long jobId;
    private final String jobTitle;
    private final String jobCompany;
    private final Long applicantId;
    private final String applicantFirstName;
    private final String applicantLastName;
    private final ApplicationStatus status;
    private final Instant appliedAt;
}
