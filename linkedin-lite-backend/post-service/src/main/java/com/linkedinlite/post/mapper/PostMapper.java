package com.linkedinlite.post.mapper;

import com.linkedinlite.post.dto.response.PostResponse;
import com.linkedinlite.post.entity.Post;
import org.springframework.stereotype.Component;

@Component
public class PostMapper {

    public PostResponse toResponse(Post post) {
        return PostResponse.builder()
                .id(post.getId())
                .authorId(post.getAuthorId())
                .authorFirstName(post.getAuthorFirstName())
                .authorLastName(post.getAuthorLastName())
                .content(post.getContent())
                .imageUrl(post.getImageUrl())
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .build();
    }
}
