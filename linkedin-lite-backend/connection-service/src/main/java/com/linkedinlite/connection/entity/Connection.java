package com.linkedinlite.connection.entity;

import com.linkedinlite.connection.enums.ConnectionStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(
        name = "connections",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_connections_pair", columnNames = {"requester_id", "receiver_id"}),
        indexes = {
                @Index(name = "idx_connections_requester", columnList = "requester_id"),
                @Index(name = "idx_connections_receiver",  columnList = "receiver_id"),
                @Index(name = "idx_connections_status",    columnList = "status")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Connection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "requester_id", nullable = false)          private Long requesterId;
    @Column(name = "requester_first_name", nullable = false)  private String requesterFirstName;
    @Column(name = "requester_last_name",  nullable = false)  private String requesterLastName;

    @Column(name = "receiver_id", nullable = false)           private Long receiverId;
    @Column(name = "receiver_first_name", nullable = false)   private String receiverFirstName;
    @Column(name = "receiver_last_name",  nullable = false)   private String receiverLastName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ConnectionStatus status;

    @Column(name = "requested_at", nullable = false, updatable = false)
    private Instant requestedAt;

    @Column(name = "responded_at")
    private Instant respondedAt;

    @PrePersist
    void onCreate() {
        if (requestedAt == null) requestedAt = Instant.now();
        if (status == null) status = ConnectionStatus.PENDING;
    }
}
