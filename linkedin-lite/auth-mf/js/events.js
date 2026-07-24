/* Event Bus interactions for auth-mf. Isolated so app.js keeps its focus
   on DOM wiring. */
(function (global) {
  'use strict';

  const { EventBus, SharedConstants } = global;
  const { EVENTS } = SharedConstants;

  function emitRegistered(user) {
    EventBus.emit(EVENTS.USER_REGISTERED, {
      userId: user.id,
      email:  user.email,
    });
  }

  function emitLogin(session) {
    EventBus.emit(EVENTS.USER_LOGIN, {
      userId:    session.user.id,
      sessionId: session.sessionId,
      name:      `${session.user.firstName} ${session.user.lastName}`,
    });
  }

  global.AuthMfEvents = Object.freeze({ emitRegistered, emitLogin });
})(window);
