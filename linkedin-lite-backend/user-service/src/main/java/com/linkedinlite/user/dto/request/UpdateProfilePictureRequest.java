package com.linkedinlite.user.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateProfilePictureRequest {

    @NotBlank
    @Size(max = 500)
    private String url;
}
