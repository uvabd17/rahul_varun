package com.linkedinlite.job.repository;

import com.linkedinlite.job.entity.JobApplication;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {

    Optional<JobApplication> findByJobIdAndApplicantId(Long jobId, Long applicantId);

    List<JobApplication> findByApplicantIdOrderByAppliedAtDesc(Long applicantId);

    List<JobApplication> findByJobIdOrderByAppliedAtDesc(Long jobId);
}
