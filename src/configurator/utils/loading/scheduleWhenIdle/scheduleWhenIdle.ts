/** Run work after the browser is idle so loader/UI can paint first. */
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
