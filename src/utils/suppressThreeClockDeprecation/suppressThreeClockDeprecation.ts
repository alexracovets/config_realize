let isSuppressed = false;

/** @react-three/fiber 9.x still uses THREE.Clock until v10. */
const suppressThreeClockDeprecation = () => {
  if (isSuppressed || typeof console === 'undefined') return;
  isSuppressed = true;

  const originalWarn = console.warn.bind(console);
  console.warn = (...args: unknown[]) => {
    const message = args[0];
    if (typeof message === 'string' && message.includes('THREE.Clock') && message.includes('deprecated')) {
      return;
    }
    originalWarn(...args);
  };
};

export { suppressThreeClockDeprecation };
