package com.linkedinlite.job.entity;

import com.linkedinlite.job.enums.JobStatus;
import com.linkedinlite.job.enums.JobType;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(
        name = "jobs",
        indexes = {
                @Index(name = "idx_jobs_status", columnList = "status"),
                @Index(name = "idx_jobs_type",   columnList = "job_type"),
                @Index(name = "idx_jobs_posted", columnList = "posted_at")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "posted_by", nullable = false)
    private Long postedBy;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, length = 200)
    private String company;

    @Column(length = 200)
    private String location;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "job_type", nullable = false, length = 20)
    private JobType jobType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private JobStatus status;

    @Column(name = "posted_at", nullable = false, updatable = false)
    private Instant postedAt;

    @PrePersist
    void onCreate() {
        if (postedAt == null) postedAt = Instant.now();
        if (status   == null) status   = JobStatus.OPEN;
    }
}
