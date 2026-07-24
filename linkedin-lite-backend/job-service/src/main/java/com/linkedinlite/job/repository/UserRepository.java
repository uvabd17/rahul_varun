package com.linkedinlite.job.repository;

import com.linkedinlite.job.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
}
