'use client';

import { useEffect } from 'react';

import { isEmbeddedSession } from '@utils';
import { postEmbeddedHeightToParent } from '@utils/embeddedUrlSync';

// Ignore sub-pixel churn so a resize loop can't feed itself.
const HEIGHT_EPSILON_PX = 2;

const EmbeddedHeightBridge = () => {
  useEffect(() => {
    if (!isEmbeddedSession() || window.parent === window) return;

    // Flags the stylesheet rules that let the shell grow past the frame viewport.
    document.documentElement.dataset.embedded = '1';

    let lastSent = 0;
    let frame = 0;

    const measure = () => {
      const { documentElement, body } = document;

      return Math.ceil(
        Math.max(
          documentElement.scrollHeight,
          documentElement.offsetHeight,
          body?.scrollHeight ?? 0,
          body?.offsetHeight ?? 0,
        ),
      );
    };

    const publish = () => {
      frame = 0;
      const height = measure();
      if (!height || Math.abs(height - lastSent) < HEIGHT_EPSILON_PX) return;

      lastSent = height;
      postEmbeddedHeightToParent(height);
    };

    // Measurements are batched into a frame so a burst of mutations sends one message.
    const schedule = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(publish);
    };

    schedule();

    const observer = new ResizeObserver(schedule);
    observer.observe(document.documentElement);
    if (document.body) observer.observe(document.body);

    window.addEventListener('resize', schedule);
    window.addEventListener('orientationchange', schedule);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('resize', schedule);
      window.removeEventListener('orientationchange', schedule);
      delete document.documentElement.dataset.embedded;
    };
  }, []);

  return null;
};

export { EmbeddedHeightBridge };
