'use client';

import { useEffect } from 'react';

import { isEmbeddedSession } from '@utils';

// iOS WebKit inside in-app browsers (Viber, Telegram) can compute dvh/svh against a stale
// viewport on the very first paint of a cross-origin iframe: the toolbar chrome hasn't
// settled yet, so both the host page and this frame lay out against the wrong height —
// the Shopify header and our step tabs end up pushed outside the visible area. Returning
// from another site (bfcache restore / visibility change) always fixes it, because that
// transition forces WebKit to recompute viewport units. This bridge forces that same
// recompute proactively: nudging this frame's own height by a fraction of a pixel
// invalidates layout enough for WebKit to re-resolve dvh/svh across the frame chain.
const kickViewportRecalculation = () => {
  const { documentElement } = document;
  const previousMinHeight = documentElement.style.minHeight;

  documentElement.style.minHeight = 'calc(100dvh + 0.01px)';

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      documentElement.style.minHeight = previousMinHeight;
    });
  });
};

const PIN_WINDOW_MS = 4000;

const EmbeddedViewportKickBridge = () => {
  useEffect(() => {
    if (!isEmbeddedSession() || window.parent === window) return;

    let pinUntil = Date.now() + PIN_WINDOW_MS;
    let userInteracted = false;

    const pinToTop = () => {
      if (userInteracted || Date.now() > pinUntil) return;
      if (window.scrollX !== 0 || window.scrollY !== 0) {
        window.scrollTo(0, 0);
      }
    };

    const extendPin = () => {
      if (userInteracted) return;
      pinUntil = Date.now() + PIN_WINDOW_MS;
      pinToTop();
    };

    const releasePin = () => {
      userInteracted = true;
    };

    const rafPin = () => {
      pinToTop();
      if (!userInteracted && Date.now() <= pinUntil) requestAnimationFrame(rafPin);
    };

    kickViewportRecalculation();
    requestAnimationFrame(rafPin);

    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        kickViewportRecalculation();
        extendPin();
      }
    };
    const onKick = () => {
      kickViewportRecalculation();
      extendPin();
    };

    window.addEventListener('scroll', pinToTop, { passive: true });
    window.addEventListener('touchstart', releasePin, { passive: true });
    window.addEventListener('wheel', releasePin, { passive: true });
    window.addEventListener('pageshow', onKick);
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onKick);
    window.addEventListener('resize', extendPin);

    return () => {
      window.removeEventListener('scroll', pinToTop);
      window.removeEventListener('touchstart', releasePin);
      window.removeEventListener('wheel', releasePin);
      window.removeEventListener('pageshow', onKick);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onKick);
      window.removeEventListener('resize', extendPin);
    };
  }, []);

  return null;
};

export { EmbeddedViewportKickBridge };
