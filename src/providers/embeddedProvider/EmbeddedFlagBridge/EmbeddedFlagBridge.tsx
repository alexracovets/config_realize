'use client';

import { useEffect } from 'react';

import { isEmbeddedSession } from '@utils';

// Marks the document so the stylesheet can size the shell to the iframe instead of the
// viewport. The host already subtracts its own header from the frame, and dvh inside an
// iframe still resolves to the full window, so the shell must track the frame itself.
const EmbeddedFlagBridge = () => {
  useEffect(() => {
    if (!isEmbeddedSession() || window.parent === window) return;

    document.documentElement.dataset.embedded = '1';

    return () => {
      delete document.documentElement.dataset.embedded;
    };
  }, []);

  return null;
};

export { EmbeddedFlagBridge };
