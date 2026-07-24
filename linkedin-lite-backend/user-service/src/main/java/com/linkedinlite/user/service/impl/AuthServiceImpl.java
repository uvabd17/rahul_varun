package com.linkedinlite.user.service.impl;

import com.linkedinlite.common.enums.SessionStatus;
import com.linkedinlite.common.enums.UserRole;
import com.linkedinlite.user.constants.Messages;
import com.linkedinlite.user.dto.request.LoginRequest;
import com.linkedinlite.user.dto.request.RegisterRequest;
import com.linkedinlite.user.dto.response.LoginResponse;
import com.linkedinlite.user.dto.response.UserResponse;
import com.linkedinlite.user.entity.Profile;
import com.linkedinlite.user.entity.User;
import com.linkedinlite.user.entity.UserSession;
import com.linkedinlite.user.enums.UserStatus;
import com.linkedinlite.user.exception.DuplicateResourceException;
import com.linkedinlite.user.exception.InvalidCredentialsException;
import com.linkedinlite.user.exception.ResourceNotFoundException;
import com.linkedinlite.user.mapper.UserMapper;
import com.linkedinlite.user.repository.ProfileRepository;
import com.linkedinlite.user.repository.UserRepository;
import com.linkedinlite.user.repository.UserSessionRepository;
import com.linkedinlite.user.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepo;
    private final UserSessionRepository sessionRepo;
    private final ProfileRepository profileRepo;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;

    @Override
    @Transactional
    public UserResponse register(RegisterRequest req) {
        if (userRepo.existsByEmailIgnoreCase(req.getEmail())) {
            throw new DuplicateResourceException(Messages.EMAIL_TAKEN);
        }

        User user = User.builder()
                .email(req.getEmail().toLowerCase())
                .firstName(req.getFirstName().trim())
                .lastName(req.getLastName().trim())
                .passwordHash(passwordEncoder.encode(req.getPassword()))
                .role(Optional.ofNullable(req.getRole()).orElse(UserRole.USER))
                .status(UserStatus.ACTIVE)
                .build();

        User saved = userRepo.save(user);

        // Empty profile row is created eagerly so Module 2 has a target to update.
        profileRepo.save(Profile.builder().userId(saved.getId()).build());

        log.info("Registered user id={} email={}", saved.getId(), saved.getEmail());
        return userMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public LoginResponse login(LoginRequest req) {
        User user = userRepo.findByEmailIgnoreCase(req.getEmail())
                .orElseThrow(() -> new InvalidCredentialsException(Messages.INVALID_CREDENTIALS));

        if (user.getStatus() != UserStatus.ACTIVE
                || !passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
            throw new InvalidCredentialsException(Messages.INVALID_CREDENTIALS);
        }

        UserSession session = UserSession.builder()
                .sessionId(UUID.randomUUID().toString())
                .userId(user.getId())
                .loginTime(Instant.now())
                .status(SessionStatus.ACTIVE)
                .build();
        sessionRepo.save(session);

        log.info("Login user id={} session={}", user.getId(), session.getSessionId());
        return LoginResponse.builder()
                .sessionId(session.getSessionId())
                .user(userMapper.toResponse(user))
                .build();
    }

    @Override
    @Transactional
    public void logout(String sessionId) {
        UserSession session = sessionRepo.findBySessionIdAndStatus(sessionId, SessionStatus.ACTIVE)
                .orElseThrow(() -> new ResourceNotFoundException("Active session not found"));
        session.setStatus(SessionStatus.INACTIVE);
        session.setLogoutTime(Instant.now());
        sessionRepo.save(session);
        log.info("Logout session={}", sessionId);
    }
}
