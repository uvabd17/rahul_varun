package com.linkedinlite.job.dto.response;

import com.linkedinlite.job.enums.JobStatus;
import com.linkedinlite.job.enums.JobType;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;

@Getter
@Builder
public class JobResponse {
    private final Long id;
    private final Long postedBy;
    private final String title;
    private final String company;
    private final String location;
    private final String description;
    private final JobType jobType;
    private final JobStatus status;
    private final Instant postedAt;
}
