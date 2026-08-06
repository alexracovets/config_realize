'use client';

import { useEffect } from 'react';

import { isEmbeddedSession } from '@utils';

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
