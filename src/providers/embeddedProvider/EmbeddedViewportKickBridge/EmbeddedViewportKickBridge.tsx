'use client';

import { useEffect } from 'react';

// iOS = iPhone/iPod, and iPadOS which reports as Mac but has touch.
const IS_IOS =
  typeof navigator !== 'undefined' &&
  (/iP(hone|od|ad)/.test(navigator.platform || '') ||
    /iP(hone|od|ad)/.test(navigator.userAgent || '') ||
    (navigator.platform === 'MacIntel' && (navigator.maxTouchPoints || 0) > 1));

const isSane = (height: number): boolean => height > 120 && height < 4000;

// The height the shell should actually occupy on iOS.
//
// Two different problems, both fixed by writing --configurator-vh:
//
//  1. Safari cold-loaded from an in-app WebView freezes the layout viewport shorter
//     than the screen and never fires the resize that corrects it. innerHeight and
//     documentElement.clientHeight disagree (seen 896 vs 720) — screen.availHeight is
//     then the true height.
//
//  2. Every other iOS browser (Chrome/CriOS, Edge, Firefox — all WebKit with their own
//     chrome) draws a bottom navigation bar that dvh does not subtract, so a 100dvh
//     shell runs under it and its footer controls are unreachable. Here the viewport is
//     not frozen at all, so the case-1 check never fires and the old code handed layout
//     back to the CSS fallback — which is exactly the 100dvh that is too tall.
//
// visualViewport.height is the one number that is correct in both: it is the region
// actually on screen, chrome excluded.
const viewportHeight = (): number | null => {
  if (!IS_IOS) return null;

  const vv = window.visualViewport;
  const vpH = vv ? Math.round(vv.height) : window.innerHeight;
  const screenH = window.screen?.availHeight ?? 0;
  const clientH = document.documentElement.clientHeight;

  const isFrozen = Math.abs(window.innerHeight - clientH) > 40 && screenH - vpH > 60;
  if (isFrozen && isSane(screenH)) return screenH;

  // The on-screen keyboard shrinks visualViewport but leaves innerHeight alone, while
  // browser chrome moves both. Ignore the keyboard: the configurator has text inputs
  // (name, number, custom text) and the shell must not resize under them.
  if (vv && window.innerHeight - vpH > 150) return null;

  return isSane(vpH) ? vpH : null;
};

const EmbeddedViewportKickBridge = () => {
  useEffect(() => {
    if (typeof window === 'undefined' || !IS_IOS) return;

    const root = document.documentElement;
    let lastVh = 0;

    const apply = () => {
      const height = viewportHeight();
      if (height == null) {
        // No usable measurement — leave whatever is set rather than dropping back to
        // the 100dvh fallback, which is the too-tall value on non-Safari iOS.
        return;
      }
      // Grow freely; shrink only on a deliberate, sustained change (a real rotation or
      // the chrome settling) — not a transient dip from the on-screen keyboard.
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
