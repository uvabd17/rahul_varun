/* Event Bus emissions from profile-mf. */
(function (global) {
  'use strict';

  const { EventBus, SharedConstants } = global;
  const { EVENTS } = SharedConstants;

  function emitProfileUpdated(profile) {
    EventBus.emit(EVENTS.PROFILE_UPDATED, {
      userId:  profile.userId,
      changes: {
        headline:          profile.headline,
        profilePictureUrl: profile.profilePictureUrl,
      },
    });
  }

  global.ProfileMfEvents = Object.freeze({ emitProfileUpdated });
})(window);
