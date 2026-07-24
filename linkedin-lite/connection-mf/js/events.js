(function (global) {
  'use strict';

  const { EventBus, SharedConstants } = global;
  const { EVENTS } = SharedConstants;

  const emitSent     = (fromId, toId) => EventBus.emit(EVENTS.CONNECTION_REQUEST_SENT, { fromUserId: fromId, toUserId: toId });
  const emitAccepted = (id)           => EventBus.emit(EVENTS.CONNECTION_ACCEPTED,     { connectionId: id });
  const emitRejected = (id)           => EventBus.emit(EVENTS.CONNECTION_REJECTED,     { connectionId: id });

  global.ConnectionMfEvents = Object.freeze({ emitSent, emitAccepted, emitRejected });
})(window);
