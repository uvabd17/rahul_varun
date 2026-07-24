/* In-browser pub/sub. Every MFE talks through this — never MFE-to-MFE directly.
   on() returns an unsubscribe function so MFEs can clean up on unmount. */
(function (global) {
  'use strict';

  const subscribers = new Map();

  function on(eventName, handler) {
    if (!subscribers.has(eventName)) subscribers.set(eventName, new Set());
    subscribers.get(eventName).add(handler);
    return () => subscribers.get(eventName)?.delete(handler);
  }

  function emit(eventName, payload) {
    const set = subscribers.get(eventName);
    if (!set) return;
    // Snapshot so a handler that mutates the set mid-emit doesn't skip peers.
    [...set].forEach((fn) => {
      try { fn(payload); }
      catch (err) { console.error(`[EventBus] handler failed for ${eventName}`, err); }
    });
  }

  global.EventBus = Object.freeze({ on, emit });
})(window);
