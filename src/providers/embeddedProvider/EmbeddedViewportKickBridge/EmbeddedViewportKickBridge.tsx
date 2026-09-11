'use client';

import { useEffect } from 'react';

import { isEmbeddedSession } from '@utils';

const IS_IOS =
  typeof navigator !== 'undefined' &&
  (/iP(hone|od|ad)/.test(navigator.platform || '') ||
    /iP(hone|od|ad)/.test(navigator.userAgent || '') ||
    (navigator.platform === 'MacIntel' && (navigator.maxTouchPoints || 0) > 1));

const isSane = (height: number): boolean => height > 120 && height < 4000;

const viewportHeight = (): number | null => {
  if (!IS_IOS) return null;

  const innerH = window.innerHeight;
  const vpH = window.visualViewport ? Math.round(window.visualViewport.height) : innerH;

  if (isSane(innerH)) return innerH;

  return isSane(vpH) ? vpH : null;
};

const EmbeddedViewportKickBridge = () => {
  useEffect(() => {
    if (typeof window === 'undefined' || !IS_IOS) return;
    if (!isEmbeddedSession() || window.parent === window) return;

    const root = document.documentElement;
    let lastVh = 0;

    const apply = () => {
      const height = viewportHeight();
      if (height == null) return;

      if (Math.abs(height - lastVh) >= 2) {
        lastVh = height;
        root.style.setProperty('--configurator-vh', `${height}px`);
      }
    };

    apply();
    const raf = requestAnimationFrame(apply);
    const timers = [150, 400, 900, 1500, 2500, 4000].map((ms) => window.setTimeout(apply, ms));

    const onOrientation = () => {
      apply();
      window.setTimeout(apply, 300);
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', apply);
      window.visualViewport.addEventListener('scroll', apply);
    }
    window.addEventListener('resize', apply);
    window.addEventListener('orientationchange', onOrientation);
    window.addEventListener('pageshow', apply);

    return () => {
      cancelAnimationFrame(raf);
      timers.forEach(window.clearTimeout);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', apply);
        window.visualViewport.removeEventListener('scroll', apply);
      }
      window.removeEventListener('resize', apply);
      window.removeEventListener('orientationchange', onOrientation);
      window.removeEventListener('pageshow', apply);
      root.style.removeProperty('--configurator-vh');
    };
  }, []);

  return null;
};

export { EmbeddedViewportKickBridge };
