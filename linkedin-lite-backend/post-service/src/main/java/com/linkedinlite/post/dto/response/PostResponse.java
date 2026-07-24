package com.linkedinlite.post.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.Instant;

@Getter
@Builder
public class PostResponse {
    private final Long id;
    private final Long authorId;
    private final String authorFirstName;
    private final String authorLastName;
    private final String content;
    private final String imageUrl;
    private final Instant createdAt;
    private final Instant updatedAt;
}
