package com.linkedinlite.job.service.impl;

import com.linkedinlite.job.constants.Messages;
import com.linkedinlite.job.dto.request.CreateJobRequest;
import com.linkedinlite.job.dto.request.UpdateJobRequest;
import com.linkedinlite.job.dto.request.UpdateJobStatusRequest;
import com.linkedinlite.job.dto.response.JobApplicationResponse;
import com.linkedinlite.job.dto.response.JobResponse;
import com.linkedinlite.job.entity.Job;
import com.linkedinlite.job.entity.JobApplication;
import com.linkedinlite.job.entity.User;
import com.linkedinlite.job.enums.ApplicationStatus;
import com.linkedinlite.job.enums.JobStatus;
import com.linkedinlite.job.enums.JobType;
import com.linkedinlite.job.exception.DuplicateResourceException;
import com.linkedinlite.job.exception.InvalidRequestException;
import com.linkedinlite.job.exception.ResourceNotFoundException;
import com.linkedinlite.job.mapper.JobMapper;
import com.linkedinlite.job.repository.JobApplicationRepository;
import com.linkedinlite.job.repository.JobRepository;
import com.linkedinlite.job.repository.UserRepository;
import com.linkedinlite.job.security.SessionHolder;
import com.linkedinlite.job.service.JobService;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class JobServiceImpl implements JobService {

    private final JobRepository jobRepo;
    private final JobApplicationRepository appRepo;
    private final UserRepository userRepo;
    private final JobMapper mapper;

    @Override
    @Transactional(readOnly = true)
    public List<JobResponse> search(String query, JobType type, String location) {
        SessionHolder.require();
        return jobRepo.findAll(matching(query, type, location),
                Sort.by(Sort.Direction.DESC, "postedAt"))
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public JobResponse get(Long id) {
        SessionHolder.require();
        return mapper.toResponse(findOrThrow(id));
    }

    @Override
    @Transactional
    public JobResponse create(CreateJobRequest req) {
        SessionHolder.requireAdmin();
        Job job = Job.builder()
                .postedBy(SessionHolder.require().getUserId())
                .title(req.getTitle().trim())
                .company(req.getCompany().trim())
                .location(nullIfBlank(req.getLocation()))
                .description(req.getDescription().trim())
                .jobType(req.getJobType())
                .status(JobStatus.OPEN)
                .build();
        return mapper.toResponse(jobRepo.save(job));
    }

    @Override
    @Transactional
    public JobResponse update(Long id, UpdateJobRequest req) {
        SessionHolder.requireAdmin();
        Job job = findOrThrow(id);
        job.setTitle(req.getTitle().trim());
        job.setCompany(req.getCompany().trim());
        job.setLocation(nullIfBlank(req.getLocation()));
        job.setDescription(req.getDescription().trim());
        job.setJobType(req.getJobType());
        return mapper.toResponse(jobRepo.save(job));
    }

    @Override
    @Transactional
    public JobResponse updateStatus(Long id, UpdateJobStatusRequest req) {
        SessionHolder.requireAdmin();
        Job job = findOrThrow(id);
        job.setStatus(req.getStatus());
        return mapper.toResponse(jobRepo.save(job));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        SessionHolder.requireAdmin();
        jobRepo.delete(findOrThrow(id));
    }

    @Override
    @Transactional
    public JobApplicationResponse apply(Long jobId) {
        Long me = SessionHolder.require().getUserId();
        Job job = findOrThrow(jobId);
        if (job.getStatus() != JobStatus.OPEN) {
            throw new InvalidRequestException(Messages.JOB_NOT_OPEN);
        }
        appRepo.findByJobIdAndApplicantId(jobId, me).ifPresent(dup -> {
            throw new DuplicateResourceException(Messages.ALREADY_APPLIED);
        });
        User me_ = userRepo.findById(me)
                .orElseThrow(() -> new ResourceNotFoundException(Messages.USER_NOT_FOUND));
        JobApplication app = JobApplication.builder()
                .jobId(jobId)
                .applicantId(me)
                .applicantFirstName(me_.getFirstName())
                .applicantLastName(me_.getLastName())
                .status(ApplicationStatus.APPLIED)
                .build();
        return mapper.toResponse(appRepo.save(app), job);
    }

    @Override
    @Transactional(readOnly = true)
    public List<JobApplicationResponse> myApplications() {
        Long me = SessionHolder.require().getUserId();
        List<JobApplication> apps = appRepo.findByApplicantIdOrderByAppliedAtDesc(me);
        List<JobApplicationResponse> out = new ArrayList<>(apps.size());
        // For each application we join in the job's title/company. N+1 is acceptable
        // for a personal applied-list — page sizes are small.
        for (JobApplication app : apps) {
            Job job = jobRepo.findById(app.getJobId()).orElse(null);
            out.add(mapper.toResponse(app, job));
        }
        return out;
    }

    @Override
    @Transactional(readOnly = true)
    public List<JobApplicationResponse> applicants(Long jobId) {
        SessionHolder.requireAdmin();
        Job job = findOrThrow(jobId);
        return appRepo.findByJobIdOrderByAppliedAtDesc(jobId).stream()
                .map(app -> mapper.toResponse(app, job))
                .toList();
    }

    // ------------------------------------------------------------------
    private Job findOrThrow(Long id) {
        return jobRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(Messages.JOB_NOT_FOUND));
    }

    private String nullIfBlank(String s) {
        return (s == null || s.isBlank()) ? null : s.trim();
    }

    private Specification<Job> matching(String q, JobType type, String location) {
        return (root, cq, cb) -> {
            List<Predicate> preds = new ArrayList<>();
            if (q != null && !q.isBlank()) {
                String needle = "%" + q.toLowerCase() + "%";
                preds.add(cb.or(
                        cb.like(cb.lower(root.get("title")),   needle),
                        cb.like(cb.lower(root.get("company")), needle)));
            }
            if (type != null)                              preds.add(cb.equal(root.get("jobType"), type));
            if (location != null && !location.isBlank())   preds.add(cb.like(cb.lower(root.get("location")),
                                                                   "%" + location.toLowerCase() + "%"));
            return preds.isEmpty() ? cb.conjunction() : cb.and(preds.toArray(new Predicate[0]));
        };
    }
}
