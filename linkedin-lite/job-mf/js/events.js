(function (global) {
  'use strict';

  const { EventBus, SharedConstants } = global;
  const { EVENTS } = SharedConstants;

  const emitPosted  = (job) => EventBus.emit(EVENTS.JOB_POSTED,  { jobId: job.id });
  const emitUpdated = (job) => EventBus.emit(EVENTS.JOB_UPDATED, { jobId: job.id });
  const emitApplied = (jobId, userId) =>
    EventBus.emit(EVENTS.JOB_APPLIED, { jobId, userId });

  global.JobMfEvents = Object.freeze({ emitPosted, emitUpdated, emitApplied });
})(window);
