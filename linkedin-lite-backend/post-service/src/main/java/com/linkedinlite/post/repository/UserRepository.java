package com.linkedinlite.post.repository;

import com.linkedinlite.post.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
}
