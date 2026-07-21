const scheduleWhenIdle = (work: () => void, timeoutMs = 1_500) => {
  if (typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(work, { timeout: timeoutMs });
    return;
  }

  requestAnimationFrame(() => {
    requestAnimationFrame(work);
  });
};

export { scheduleWhenIdle };
