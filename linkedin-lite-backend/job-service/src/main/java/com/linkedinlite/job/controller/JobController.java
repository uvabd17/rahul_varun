package com.linkedinlite.job.controller;

import com.linkedinlite.common.dto.ApiResponse;
import com.linkedinlite.job.constants.ApiPaths;
import com.linkedinlite.job.constants.Messages;
import com.linkedinlite.job.dto.request.CreateJobRequest;
import com.linkedinlite.job.dto.request.UpdateJobRequest;
import com.linkedinlite.job.dto.request.UpdateJobStatusRequest;
import com.linkedinlite.job.dto.response.JobApplicationResponse;
import com.linkedinlite.job.dto.response.JobResponse;
import com.linkedinlite.job.enums.JobType;
import com.linkedinlite.job.service.JobService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(ApiPaths.JOBS_BASE)
@RequiredArgsConstructor
public class JobController {

    private final JobService svc;

    @GetMapping
    public ResponseEntity<ApiResponse<List<JobResponse>>> search(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) JobType type,
            @RequestParam(required = false) String location) {
        return ResponseEntity.ok(ApiResponse.ok(svc.search(q, type, location)));
    }

    @GetMapping(ApiPaths.APPLIED)
    public ResponseEntity<ApiResponse<List<JobApplicationResponse>>> myApplied() {
        return ResponseEntity.ok(ApiResponse.ok(svc.myApplications()));
    }

    @GetMapping(ApiPaths.BY_ID)
    public ResponseEntity<ApiResponse<JobResponse>> get(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(svc.get(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<JobResponse>> create(@Valid @RequestBody CreateJobRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(svc.create(req), Messages.JOB_CREATED));
    }

    @PutMapping(ApiPaths.BY_ID)
    public ResponseEntity<ApiResponse<JobResponse>> update(
            @PathVariable Long id, @Valid @RequestBody UpdateJobRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(svc.update(id, req), Messages.JOB_UPDATED));
    }

    @PatchMapping(ApiPaths.STATUS)
    public ResponseEntity<ApiResponse<JobResponse>> updateStatus(
            @PathVariable Long id, @Valid @RequestBody UpdateJobStatusRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(svc.updateStatus(id, req), Messages.JOB_STATUS_OK));
    }

    @DeleteMapping(ApiPaths.BY_ID)
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        svc.delete(id);
        return ResponseEntity.ok(ApiResponse.ok(null, Messages.JOB_DELETED));
    }

    @PostMapping(ApiPaths.APPLY)
    public ResponseEntity<ApiResponse<JobApplicationResponse>> apply(@PathVariable Long id) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(svc.apply(id), Messages.APPLIED_OK));
    }

    @GetMapping(ApiPaths.APPLICANTS)
    public ResponseEntity<ApiResponse<List<JobApplicationResponse>>> applicants(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(svc.applicants(id)));
    }
}
