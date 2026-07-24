package com.linkedinlite.job.mapper;

import com.linkedinlite.job.dto.response.JobApplicationResponse;
import com.linkedinlite.job.dto.response.JobResponse;
import com.linkedinlite.job.entity.Job;
import com.linkedinlite.job.entity.JobApplication;
import org.springframework.stereotype.Component;

@Component
public class JobMapper {

    public JobResponse toResponse(Job job) {
        return JobResponse.builder()
                .id(job.getId())
                .postedBy(job.getPostedBy())
                .title(job.getTitle())
                .company(job.getCompany())
                .location(job.getLocation())
                .description(job.getDescription())
                .jobType(job.getJobType())
                .status(job.getStatus())
                .postedAt(job.getPostedAt())
                .build();
    }

    public JobApplicationResponse toResponse(JobApplication app, Job job) {
        return JobApplicationResponse.builder()
                .id(app.getId())
                .jobId(app.getJobId())
                .jobTitle(job != null ? job.getTitle() : null)
                .jobCompany(job != null ? job.getCompany() : null)
                .applicantId(app.getApplicantId())
                .applicantFirstName(app.getApplicantFirstName())
                .applicantLastName(app.getApplicantLastName())
                .status(app.getStatus())
                .appliedAt(app.getAppliedAt())
                .build();
    }
}
