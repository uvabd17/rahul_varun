package com.linkedinlite.user.service.impl;

import com.linkedinlite.user.constants.Messages;
import com.linkedinlite.user.dto.response.UserResponse;
import com.linkedinlite.user.entity.User;
import com.linkedinlite.user.enums.UserStatus;
import com.linkedinlite.user.exception.ResourceNotFoundException;
import com.linkedinlite.user.mapper.UserMapper;
import com.linkedinlite.user.repository.UserRepository;
import com.linkedinlite.user.security.SessionHolder;
import com.linkedinlite.user.service.UserService;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepo;
    private final UserMapper userMapper;

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> listUsers(String query) {
        // Any authenticated caller can search — used for the connections module later.
        SessionHolder.require();
        return userRepo.findAll(hasNameOrEmailLike(query))
                .stream()
                .map(userMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUser(Long id) {
        SessionHolder.require();
        return userMapper.toResponse(findOrThrow(id));
    }

    @Override
    @Transactional
    public UserResponse updateStatus(Long id, UserStatus status) {
        SessionHolder.requireAdmin();
        User user = findOrThrow(id);
        user.setStatus(status);
        return userMapper.toResponse(userRepo.save(user));
    }

    private User findOrThrow(Long id) {
        return userRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(Messages.USER_NOT_FOUND));
    }

    /**
     * Dynamic search predicate. Empty query → returns everyone;
     * otherwise LIKE-matches first name, last name, or email.
     */
    private Specification<User> hasNameOrEmailLike(String query) {
        return (root, cq, cb) -> {
            if (query == null || query.isBlank()) return cb.conjunction();
            String needle = "%" + query.toLowerCase() + "%";
            Predicate byFirst = cb.like(cb.lower(root.get("firstName")), needle);
            Predicate byLast  = cb.like(cb.lower(root.get("lastName")),  needle);
            Predicate byEmail = cb.like(cb.lower(root.get("email")),     needle);
            return cb.or(byFirst, byLast, byEmail);
        };
    }
}
