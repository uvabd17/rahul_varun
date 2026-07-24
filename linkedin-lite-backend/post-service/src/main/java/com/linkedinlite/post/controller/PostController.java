package com.linkedinlite.post.controller;

import com.linkedinlite.common.dto.ApiResponse;
import com.linkedinlite.post.constants.ApiPaths;
import com.linkedinlite.post.constants.Messages;
import com.linkedinlite.post.dto.request.CreatePostRequest;
import com.linkedinlite.post.dto.request.UpdatePostRequest;
import com.linkedinlite.post.dto.response.PostResponse;
import com.linkedinlite.post.service.PostService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(ApiPaths.POSTS_BASE)
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    @PostMapping
    public ResponseEntity<ApiResponse<PostResponse>> create(@Valid @RequestBody CreatePostRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(postService.create(req), Messages.POST_CREATED));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<PostResponse>>> feed(
            @RequestParam(required = false) String q) {
        return ResponseEntity.ok(ApiResponse.ok(postService.feed(q)));
    }

    @GetMapping(ApiPaths.POSTS_BY_USER)
    public ResponseEntity<ApiResponse<List<PostResponse>>> byUser(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.ok(postService.byUser(userId)));
    }

    @GetMapping(ApiPaths.POST_BY_ID)
    public ResponseEntity<ApiResponse<PostResponse>> get(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(postService.get(id)));
    }

    @PutMapping(ApiPaths.POST_BY_ID)
    public ResponseEntity<ApiResponse<PostResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody UpdatePostRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(postService.update(id, req), Messages.POST_UPDATED));
    }

    @DeleteMapping(ApiPaths.POST_BY_ID)
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        postService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok(null, Messages.POST_DELETED));
    }
}
