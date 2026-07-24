package com.linkedinlite.job.entity;

import com.linkedinlite.job.enums.ApplicationStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(
        name = "job_applications",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_job_apps_pair", columnNames = {"job_id", "applicant_id"}),
        indexes = {
                @Index(name = "idx_job_apps_job",       columnList = "job_id"),
                @Index(name = "idx_job_apps_applicant", columnList = "applicant_id")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "job_id", nullable = false)
    private Long jobId;

    @Column(name = "applicant_id", nullable = false)
    private Long applicantId;

    @Column(name = "applicant_first_name", nullable = false, length = 60)
    private String applicantFirstName;

    @Column(name = "applicant_last_name", nullable = false, length = 60)
    private String applicantLastName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ApplicationStatus status;

    @Column(name = "applied_at", nullable = false, updatable = false)
    private Instant appliedAt;

    @PrePersist
    void onCreate() {
        if (appliedAt == null) appliedAt = Instant.now();
        if (status    == null) status    = ApplicationStatus.APPLIED;
    }
}
