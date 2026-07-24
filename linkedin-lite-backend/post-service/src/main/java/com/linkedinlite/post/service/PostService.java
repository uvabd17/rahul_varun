package com.linkedinlite.post.service;

import com.linkedinlite.post.dto.request.CreatePostRequest;
import com.linkedinlite.post.dto.request.UpdatePostRequest;
import com.linkedinlite.post.dto.response.PostResponse;

import java.util.List;

public interface PostService {

    PostResponse create(CreatePostRequest request);

    List<PostResponse> feed(String query);

    List<PostResponse> byUser(Long userId);

    PostResponse get(Long id);

    PostResponse update(Long id, UpdatePostRequest request);

    void delete(Long id);
}
