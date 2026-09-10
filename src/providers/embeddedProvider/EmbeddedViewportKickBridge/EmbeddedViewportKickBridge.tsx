'use client';

import { useEffect } from 'react';

// iOS = iPhone/iPod, and iPadOS which reports as Mac but has touch.
const IS_IOS =
  typeof navigator !== 'undefined' &&
  (/iP(hone|od|ad)/.test(navigator.platform || '') ||
    /iP(hone|od|ad)/.test(navigator.userAgent || '') ||
    (navigator.platform === 'MacIntel' && (navigator.maxTouchPoints || 0) > 1));

const clampedViewportHeight = (): number | null => {
  if (!IS_IOS) return null;

  const vv = window.visualViewport;
  const vpH = vv ? Math.round(vv.height) : window.innerHeight;
  const screenH = window.screen?.availHeight ?? 0;
  const clientH = document.documentElement.clientHeight;

  const isClamped = Math.abs(window.innerHeight - clientH) > 40 && screenH - vpH > 60;
  if (!isClamped) return null;

  return screenH > 120 && screenH < 4000 ? screenH : null;
};

const EmbeddedViewportKickBridge = () => {
  useEffect(() => {
    if (typeof window === 'undefined' || !IS_IOS) return;

    const root = document.documentElement;
    let lastVh = 0;

    const apply = () => {
      const height = clampedViewportHeight();
      if (height == null) {
        // Not (or no longer) clamped — hand layout back to the CSS fallback.
        if (lastVh !== 0) {
          lastVh = 0;
          root.style.removeProperty('--configurator-vh');
        }
        return;
      }
      if (height > lastVh || height < lastVh - 60) {
        lastVh = height;
        root.style.setProperty('--configurator-vh', `${Math.round(height)}px`);
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
    } else {
      window.addEventListener('resize', apply);
    }
    window.addEventListener('orientationchange', onOrientation);
    window.addEventListener('pageshow', apply);

    return () => {
      cancelAnimationFrame(raf);
      timers.forEach(window.clearTimeout);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', apply);
        window.visualViewport.removeEventListener('scroll', apply);
      } else {
        window.removeEventListener('resize', apply);
      }
      window.removeEventListener('orientationchange', onOrientation);
      window.removeEventListener('pageshow', apply);
      root.style.removeProperty('--configurator-vh');
    };
  }, []);

  return null;
};

export { EmbeddedViewportKickBridge };
