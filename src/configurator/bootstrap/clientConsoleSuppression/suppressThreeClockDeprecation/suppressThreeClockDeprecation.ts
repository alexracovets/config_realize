let isSuppressed = false;

const suppressThreeClockDeprecation = () => {
  if (isSuppressed || typeof console === 'undefined') return;
  isSuppressed = true;

  const originalWarn = console.warn.bind(console);
  console.warn = (...args: unknown[]) => {
    const message = args[0];
    if (typeof message !== 'string') {
      originalWarn(...args);
      return;
    }

    if (message.includes('THREE.Clock') && message.includes('deprecated')) return;
    if (message.includes('THREE.WebGLProgram')) return;
    if (message.includes('cannot be represented accurately in double precision')) return;
    if (message.includes('Multiple instances of Three.js being imported')) return;

    originalWarn(...args);
  };
};

if (typeof window !== 'undefined') {
  suppressThreeClockDeprecation();
}

export { suppressThreeClockDeprecation };
