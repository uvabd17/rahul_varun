package com.linkedinlite.connection.service;

import com.linkedinlite.connection.dto.request.SendConnectionRequest;
import com.linkedinlite.connection.dto.response.ConnectionReport;
import com.linkedinlite.connection.dto.response.ConnectionResponse;

import java.util.List;

public interface ConnectionService {

    ConnectionResponse send(SendConnectionRequest request);

    List<ConnectionResponse> myAccepted();

    List<ConnectionResponse> incomingPending();

    ConnectionResponse accept(Long id);

    ConnectionResponse reject(Long id);

    void remove(Long id);

    ConnectionReport reports();
}
