'use client';

import { useEffect } from 'react';

// On an iOS in-app-browser cold load WebKit hands the page a viewport shorter than
// the screen and never sends the resize that would correct it. This bridge writes
// --configurator-vh so the shell is sized against the real height rather than that
// short layout viewport; globals.css falls back to 100% until the first
// measurement lands. The host page (configurator-embed.js) additionally un-clamps
// the viewport outright once the DOM exists; this keeps the layout correct in the
// window before it does.
//
// iOS = iPhone/iPod, and iPadOS which reports as Mac but has touch. The
// screen.availHeight fallback is iOS-only; on desktop the inner/screen gap is just
// browser UI and must be left alone.
const IS_IOS =
  typeof navigator !== 'undefined' &&
  (/iP(hone|od|ad)/.test(navigator.platform || '') ||
    /iP(hone|od|ad)/.test(navigator.userAgent || '') ||
    (navigator.platform === 'MacIntel' && (navigator.maxTouchPoints || 0) > 1));

const readViewportHeight = (): number => {
  const vv = window.visualViewport;
  const vpH = vv ? Math.round(vv.height) : window.innerHeight;
  const screenH = window.screen?.availHeight ?? 0;
  const clientH = document.documentElement.clientHeight;

  let height = vpH;

  // The clamped iOS cold load: innerHeight and documentElement.clientHeight
  // disagree (seen 896 vs 720). A normal load has them equal (e.g. 699/699) and
  // must be left alone — using the screen height there makes the shell taller than
  // the viewport and it scrolls under the chrome.
  const isClamped = IS_IOS && Math.abs(window.innerHeight - clientH) > 40 && screenH - vpH > 60;
  if (isClamped) {
    height = screenH;
  }

  if (!(height > 120 && height < 4000)) {
    height = window.innerHeight;
  }

  return height;
};

const EmbeddedViewportKickBridge = () => {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let lastVh = 0;
    const apply = () => {
      const height = readViewportHeight();
      // Grow freely; shrink only on a deliberate, sustained change (a real
      // rotation to a shorter viewport) — not a transient dip from the keyboard
      // or chrome.
      if (height > 120 && (height > lastVh || height < lastVh - 60)) {
        lastVh = height;
        document.documentElement.style.setProperty('--configurator-vh', `${Math.round(height)}px`);
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
    };
  }, []);

  return null;
};

export { EmbeddedViewportKickBridge };
