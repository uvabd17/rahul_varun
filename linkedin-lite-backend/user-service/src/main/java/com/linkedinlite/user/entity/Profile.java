package com.linkedinlite.user.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Companion row created alongside a user. Module 1 keeps it empty;
 * Module 2 fills in headline, about, picture URL, skills, etc.
 */
@Entity
@Table(
        name = "profiles",
        uniqueConstraints = @UniqueConstraint(name = "uk_profiles_user", columnNames = "user_id")
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Profile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(length = 160)
    private String headline;

    @Column(columnDefinition = "TEXT")
    private String about;

    @Column(length = 120)
    private String location;

    @Column(name = "profile_picture_url", length = 500)
    private String profilePictureUrl;

    // JSON columns — Module 2 will manage the shape via mapper helpers.
    @Column(columnDefinition = "JSON")
    private String skills;

    @Column(columnDefinition = "JSON")
    private String education;

    @Column(columnDefinition = "JSON")
    private String experience;
}
