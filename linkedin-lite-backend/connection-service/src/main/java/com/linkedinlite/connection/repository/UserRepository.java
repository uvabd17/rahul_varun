package com.linkedinlite.connection.repository;

import com.linkedinlite.connection.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
}
