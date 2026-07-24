(function (global) {
  'use strict';

  const { EventBus, SharedConstants } = global;
  const { EVENTS } = SharedConstants;

  const emitCreated = (post) => EventBus.emit(EVENTS.POST_CREATED, { postId: post.id, authorId: post.authorId });
  const emitUpdated = (post) => EventBus.emit(EVENTS.POST_UPDATED, { postId: post.id });
  const emitDeleted = (id)   => EventBus.emit(EVENTS.POST_DELETED, { postId: id });

  global.PostMfEvents = Object.freeze({ emitCreated, emitUpdated, emitDeleted });
})(window);
