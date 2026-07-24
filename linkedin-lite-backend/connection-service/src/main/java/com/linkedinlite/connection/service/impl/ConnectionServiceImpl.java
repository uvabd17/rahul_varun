package com.linkedinlite.connection.service.impl;

import com.linkedinlite.connection.constants.Messages;
import com.linkedinlite.connection.dto.request.SendConnectionRequest;
import com.linkedinlite.connection.dto.response.ConnectionReport;
import com.linkedinlite.connection.dto.response.ConnectionResponse;
import com.linkedinlite.connection.entity.Connection;
import com.linkedinlite.connection.entity.User;
import com.linkedinlite.connection.enums.ConnectionStatus;
import com.linkedinlite.connection.exception.DuplicateResourceException;
import com.linkedinlite.connection.exception.ForbiddenException;
import com.linkedinlite.connection.exception.InvalidRequestException;
import com.linkedinlite.connection.exception.ResourceNotFoundException;
import com.linkedinlite.connection.mapper.ConnectionMapper;
import com.linkedinlite.connection.repository.ConnectionRepository;
import com.linkedinlite.connection.repository.UserRepository;
import com.linkedinlite.connection.security.SessionHolder;
import com.linkedinlite.connection.service.ConnectionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ConnectionServiceImpl implements ConnectionService {

    private final ConnectionRepository connectionRepo;
    private final UserRepository userRepo;
    private final ConnectionMapper mapper;

    @Override
    @Transactional
    public ConnectionResponse send(SendConnectionRequest req) {
        Long me = SessionHolder.require().getUserId();
        if (me.equals(req.getReceiverId())) {
            throw new InvalidRequestException(Messages.CANNOT_SELF);
        }
        User requester = userRepo.findById(me)
                .orElseThrow(() -> new ResourceNotFoundException(Messages.USER_NOT_FOUND));
        User receiver = userRepo.findById(req.getReceiverId())
                .orElseThrow(() -> new ResourceNotFoundException(Messages.USER_NOT_FOUND));

        // Reject if either direction already exists (regardless of status) — one request per pair.
        connectionRepo.findByRequesterIdAndReceiverId(me, receiver.getId())
                .or(() -> connectionRepo.findByRequesterIdAndReceiverId(receiver.getId(), me))
                .ifPresent(existing -> { throw new DuplicateResourceException(Messages.DUPLICATE); });

        Connection c = Connection.builder()
                .requesterId(requester.getId())
                .requesterFirstName(requester.getFirstName())
                .requesterLastName(requester.getLastName())
                .receiverId(receiver.getId())
                .receiverFirstName(receiver.getFirstName())
                .receiverLastName(receiver.getLastName())
                .status(ConnectionStatus.PENDING)
                .build();
        return mapper.toResponse(connectionRepo.save(c));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ConnectionResponse> myAccepted() {
        Long me = SessionHolder.require().getUserId();
        return connectionRepo.findByStatusAndInvolves(ConnectionStatus.ACCEPTED, me).stream()
                .map(mapper::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ConnectionResponse> incomingPending() {
        Long me = SessionHolder.require().getUserId();
        return connectionRepo.findByStatusAndReceiverIdOrderByRequestedAtDesc(
                ConnectionStatus.PENDING, me).stream()
                .map(mapper::toResponse).toList();
    }

    @Override
    @Transactional
    public ConnectionResponse accept(Long id) {
        return respond(id, ConnectionStatus.ACCEPTED);
    }

    @Override
    @Transactional
    public ConnectionResponse reject(Long id) {
        return respond(id, ConnectionStatus.REJECTED);
    }

    @Override
    @Transactional
    public void remove(Long id) {
        Long me = SessionHolder.require().getUserId();
        Connection c = findOrThrow(id);
        if (!me.equals(c.getRequesterId()) && !me.equals(c.getReceiverId())) {
            throw new ForbiddenException(Messages.NOT_INVOLVED);
        }
        connectionRepo.delete(c);
    }

    @Override
    @Transactional(readOnly = true)
    public ConnectionReport reports() {
        SessionHolder.requireAdmin();
        long pending  = connectionRepo.countByStatus(ConnectionStatus.PENDING);
        long accepted = connectionRepo.countByStatus(ConnectionStatus.ACCEPTED);
        long rejected = connectionRepo.countByStatus(ConnectionStatus.REJECTED);
        return ConnectionReport.builder()
                .total(pending + accepted + rejected)
                .pending(pending)
                .accepted(accepted)
                .rejected(rejected)
                .build();
    }

    // ------------------------------------------------------------------
    private ConnectionResponse respond(Long id, ConnectionStatus newStatus) {
        Long me = SessionHolder.require().getUserId();
        Connection c = findOrThrow(id);
        if (!me.equals(c.getReceiverId())) {
            throw new ForbiddenException(Messages.NOT_RECEIVER);
        }
        if (c.getStatus() != ConnectionStatus.PENDING) {
            throw new InvalidRequestException(Messages.NOT_PENDING);
        }
        c.setStatus(newStatus);
        c.setRespondedAt(Instant.now());
        return mapper.toResponse(connectionRepo.save(c));
    }

    private Connection findOrThrow(Long id) {
        return connectionRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(Messages.NOT_FOUND));
    }
}
