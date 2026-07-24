package com.linkedinlite.connection.dto.response;

import com.linkedinlite.connection.enums.ConnectionStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;

@Getter
@Builder
public class ConnectionResponse {
    private final Long id;
    private final Long requesterId;
    private final String requesterFirstName;
    private final String requesterLastName;
    private final Long receiverId;
    private final String receiverFirstName;
    private final String receiverLastName;
    private final ConnectionStatus status;
    private final Instant requestedAt;
    private final Instant respondedAt;
}
