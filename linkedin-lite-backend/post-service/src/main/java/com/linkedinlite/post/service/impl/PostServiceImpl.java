package com.linkedinlite.post.service.impl;

import com.linkedinlite.common.enums.UserRole;
import com.linkedinlite.post.constants.Messages;
import com.linkedinlite.post.dto.request.CreatePostRequest;
import com.linkedinlite.post.dto.request.UpdatePostRequest;
import com.linkedinlite.post.dto.response.PostResponse;
import com.linkedinlite.post.entity.Post;
import com.linkedinlite.post.entity.User;
import com.linkedinlite.post.enums.PostStatus;
import com.linkedinlite.post.exception.ForbiddenException;
import com.linkedinlite.post.exception.ResourceNotFoundException;
import com.linkedinlite.post.mapper.PostMapper;
import com.linkedinlite.post.repository.PostRepository;
import com.linkedinlite.post.repository.UserRepository;
import com.linkedinlite.post.security.SessionHolder;
import com.linkedinlite.post.service.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PostServiceImpl implements PostService {

    private final PostRepository postRepo;
    private final UserRepository userRepo;
    private final PostMapper mapper;

    @Override
    @Transactional
    public PostResponse create(CreatePostRequest req) {
        var ctx = SessionHolder.require();
        // Denormalise the author name so the feed doesn't need to join users.
        User author = userRepo.findById(ctx.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException(Messages.USER_NOT_FOUND));

        Post post = Post.builder()
                .authorId(author.getId())
                .authorFirstName(author.getFirstName())
                .authorLastName(author.getLastName())
                .content(req.getContent().trim())
                .imageUrl(nullIfBlank(req.getImageUrl()))
                .status(PostStatus.ACTIVE)
                .build();

        return mapper.toResponse(postRepo.save(post));
    }

    @Override
    @Transactional(readOnly = true)
    public List<PostResponse> feed(String query) {
        SessionHolder.require();
        return postRepo.findAll(activeMatching(query), Sort.by(Sort.Direction.DESC, "createdAt"))
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<PostResponse> byUser(Long userId) {
        SessionHolder.require();
        return postRepo.findAll(byAuthor(userId), Sort.by(Sort.Direction.DESC, "createdAt"))
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public PostResponse get(Long id) {
        SessionHolder.require();
        return mapper.toResponse(findActiveOrThrow(id));
    }

    @Override
    @Transactional
    public PostResponse update(Long id, UpdatePostRequest req) {
        Post post = findActiveOrThrow(id);
        requireOwnerOrAdmin(post.getAuthorId());

        post.setContent(req.getContent().trim());
        post.setImageUrl(nullIfBlank(req.getImageUrl()));
        return mapper.toResponse(postRepo.save(post));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Post post = findActiveOrThrow(id);
        requireOwnerOrAdmin(post.getAuthorId());
        post.setStatus(PostStatus.DELETED);
        postRepo.save(post);
    }

    // ------------------------------------------------------------------
    private Post findActiveOrThrow(Long id) {
        Post p = postRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(Messages.POST_NOT_FOUND));
        if (p.getStatus() == PostStatus.DELETED) {
            throw new ResourceNotFoundException(Messages.POST_NOT_FOUND);
        }
        return p;
    }

    private void requireOwnerOrAdmin(Long authorId) {
        var ctx = SessionHolder.require();
        if (!authorId.equals(ctx.getUserId()) && ctx.getRole() != UserRole.ADMIN) {
            throw new ForbiddenException(Messages.NOT_POST_OWNER);
        }
    }

    private Specification<Post> activeMatching(String query) {
        return (root, cq, cb) -> {
            var active = cb.equal(root.get("status"), PostStatus.ACTIVE);
            if (query == null || query.isBlank()) return active;
            String needle = "%" + query.toLowerCase() + "%";
            return cb.and(active, cb.or(
                    cb.like(cb.lower(root.get("content")),         needle),
                    cb.like(cb.lower(root.get("authorFirstName")), needle),
                    cb.like(cb.lower(root.get("authorLastName")),  needle)
            ));
        };
    }

    private Specification<Post> byAuthor(Long userId) {
        return (root, cq, cb) -> cb.and(
                cb.equal(root.get("authorId"), userId),
                cb.equal(root.get("status"),   PostStatus.ACTIVE)
        );
    }

    private String nullIfBlank(String s) {
        return (s == null || s.isBlank()) ? null : s.trim();
    }
}
