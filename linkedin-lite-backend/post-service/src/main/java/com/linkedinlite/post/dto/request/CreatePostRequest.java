package com.linkedinlite.post.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreatePostRequest {

    @NotBlank
    @Size(max = 3000)
    private String content;

    @Size(max = 500)
    private String imageUrl;
}
