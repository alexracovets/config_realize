/** Yield the main thread so loader/UI can paint between heavy scene steps. */
const yieldToMain = (): Promise<void> =>
  new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });

export { yieldToMain };
