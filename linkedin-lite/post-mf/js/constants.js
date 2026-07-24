(function (global) {
  'use strict';

  global.PostMfConstants = Object.freeze({
    ENDPOINTS: Object.freeze({
      FEED:    '/posts',
      BY_ID:   (id) => `/posts/${id}`,
      BY_USER: (userId) => `/posts/user/${userId}`,
    }),

    TABS: Object.freeze({ FEED: 'feed', MINE: 'mine' }),

    MESSAGES: Object.freeze({
      POSTED:      'Post shared',
      UPDATED:     'Post updated',
      DELETED:     'Post deleted',
      CONFIRM_DEL: 'Delete this post?',
      EMPTY_FEED:  'Nothing here yet. Be the first to post.',
      EMPTY_MINE:  'You have not posted anything yet.',
      LOAD_FAILED: 'Could not load posts',
      REQUIRED:    'Write something first',
    }),

    SEARCH_DEBOUNCE_MS: 250,
  });
})(window);
