package com.linkedinlite.connection.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ConnectionReport {
    private final long total;
    private final long pending;
    private final long accepted;
    private final long rejected;
}
