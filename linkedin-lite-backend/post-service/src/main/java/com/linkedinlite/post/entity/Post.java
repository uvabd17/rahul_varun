package com.linkedinlite.post.entity;

import com.linkedinlite.post.enums.PostStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(
        name = "posts",
        indexes = {
                @Index(name = "idx_posts_author",  columnList = "author_id"),
                @Index(name = "idx_posts_status",  columnList = "status"),
                @Index(name = "idx_posts_created", columnList = "created_at")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "author_id", nullable = false)
    private Long authorId;

    // Denormalised at post-creation time so the feed doesn't hop to users.
    @Column(name = "author_first_name", nullable = false, length = 60)
    private String authorFirstName;

    @Column(name = "author_last_name", nullable = false, length = 60)
    private String authorLastName;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PostStatus status;

    @PrePersist
    void onCreate() {
        if (createdAt == null) createdAt = Instant.now();
        if (status    == null) status    = PostStatus.ACTIVE;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }
}
