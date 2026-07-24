package com.linkedinlite.post.entity;

import com.linkedinlite.common.enums.UserRole;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * Slim read-only view of the shared users table. post-service never
 * writes to users — it only reads the author's name at post creation
 * and the caller's role during authorisation.
 */
@Entity
@Table(name = "users")
@Getter
@NoArgsConstructor
public class User {

    @Id
    private Long id;

    @Column(name = "first_name") private String firstName;
    @Column(name = "last_name")  private String lastName;

    @Enumerated(EnumType.STRING) private UserRole role;
}
