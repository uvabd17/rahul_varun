package com.linkedinlite.connection.repository;

import com.linkedinlite.connection.entity.Connection;
import com.linkedinlite.connection.enums.ConnectionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ConnectionRepository extends JpaRepository<Connection, Long> {

    @Query("""
           SELECT c FROM Connection c
           WHERE c.status = :status
             AND (c.requesterId = :userId OR c.receiverId = :userId)
           ORDER BY c.requestedAt DESC
           """)
    List<Connection> findByStatusAndInvolves(@Param("status") ConnectionStatus status,
                                             @Param("userId") Long userId);

    List<Connection> findByStatusAndReceiverIdOrderByRequestedAtDesc(ConnectionStatus status, Long receiverId);

    Optional<Connection> findByRequesterIdAndReceiverId(Long requesterId, Long receiverId);

    long countByStatus(ConnectionStatus status);
}
