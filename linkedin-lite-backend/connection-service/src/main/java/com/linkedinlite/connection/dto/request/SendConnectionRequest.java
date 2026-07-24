package com.linkedinlite.connection.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SendConnectionRequest {

    @NotNull
    private Long receiverId;
}
