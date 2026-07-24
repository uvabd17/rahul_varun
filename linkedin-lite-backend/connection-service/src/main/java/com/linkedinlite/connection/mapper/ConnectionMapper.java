package com.linkedinlite.connection.mapper;

import com.linkedinlite.connection.dto.response.ConnectionResponse;
import com.linkedinlite.connection.entity.Connection;
import org.springframework.stereotype.Component;

@Component
public class ConnectionMapper {
    public ConnectionResponse toResponse(Connection c) {
        return ConnectionResponse.builder()
                .id(c.getId())
                .requesterId(c.getRequesterId())
                .requesterFirstName(c.getRequesterFirstName())
                .requesterLastName(c.getRequesterLastName())
                .receiverId(c.getReceiverId())
                .receiverFirstName(c.getReceiverFirstName())
                .receiverLastName(c.getReceiverLastName())
                .status(c.getStatus())
                .requestedAt(c.getRequestedAt())
                .respondedAt(c.getRespondedAt())
                .build();
    }
}
