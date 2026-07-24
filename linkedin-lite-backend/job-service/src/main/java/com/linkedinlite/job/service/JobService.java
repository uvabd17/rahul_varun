package com.linkedinlite.job.service;

import com.linkedinlite.job.dto.request.CreateJobRequest;
import com.linkedinlite.job.dto.request.UpdateJobRequest;
import com.linkedinlite.job.dto.request.UpdateJobStatusRequest;
import com.linkedinlite.job.dto.response.JobApplicationResponse;
import com.linkedinlite.job.dto.response.JobResponse;
import com.linkedinlite.job.enums.JobType;

import java.util.List;

public interface JobService {

    List<JobResponse> search(String query, JobType type, String location);

    JobResponse get(Long id);

    JobResponse create(CreateJobRequest request);

    JobResponse update(Long id, UpdateJobRequest request);

    JobResponse updateStatus(Long id, UpdateJobStatusRequest request);

    void delete(Long id);

    JobApplicationResponse apply(Long jobId);

    List<JobApplicationResponse> myApplications();

    List<JobApplicationResponse> applicants(Long jobId);
}
