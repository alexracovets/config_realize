'use client';

import { useEffect } from 'react';

import { isEmbeddedSession } from '@utils';

// iOS has two viewports and on a cold load they disagree:
//
//   * the LAYOUT viewport is what CSS resolves %, vh, 100dvh and position:fixed
//     against — on first paint WebKit sizes it for the *collapsed* chrome (tall);
//   * the VISUAL viewport is what the user actually sees right now — with the
//     address bar / bottom bar still expanded it is shorter, and WebKit offsets it
//     downward inside the layout viewport (window.visualViewport.offsetTop > 0).
//
// So the shell is not merely mis-sized — the "camera" is pointed below the top of
// the layout box. The store logo row sits above offsetTop and is clipped; the step
// tabs (dashed separators + sliding gradient indicator) become the first visible
// row; and below the shell's 100dvh box the layout viewport keeps going, showing as
// empty page under the footer. overflow:hidden / position:fixed are pinned to the
// LAYOUT viewport, so they do not hold content in view while the visual viewport is
// shifted. A reload fixes it because both viewports initialise together; returning
// from another app fixes it because that forces WebKit to reconcile them.
//
// Fix, in two parts, both driven by window.visualViewport (the one API that always
// reports the real visible box and fires 'resize'/'scroll' when the chrome settles):
//   1. --configurator-vh  = visualViewport.height  -> real height for the shell
//      (globals.css falls back to 100% only until the first measurement lands).
//   2. --configurator-vv-top = visualViewport.offsetTop -> the camera shift, which
//      the shell counteracts with a translateY so its top lines up with what the
//      user sees. Snaps back to 0 once the viewports reconcile.
const readViewport = () => {
  const vv = window.visualViewport;

  return {
    height: vv?.height ?? window.innerHeight,
    // offsetTop: gap between the visual viewport's top and the layout viewport's
    // top. pageTop is the same measured from the document origin; offsetTop is the
    // one we want (independent of document scroll).
    offsetTop: vv?.offsetTop ?? 0,
  };
};

// Diagnostic trace for the iOS two-viewport cold-load shift, from inside the frame.
// Logs the layout viewport, the visual viewport (height / offsetTop / pageTop /
// scale), the document scroll offset and the actual on-screen position of the
// .configurator-shell top edge, tagged with a phase label. Runs for the first ~6s
// of a cold load only, then stops on its own. Remove once confirmed on device.
const traceViewport = (() => {
  const START = Date.now();
  const TRACE_WINDOW_MS = 6000;
  let lastSignature = '';

  return (label: string) => {
    const elapsed = Date.now() - START;
    if (elapsed > TRACE_WINDOW_MS) return;

    const vv = window.visualViewport;
    const shell = document.querySelector('.configurator-shell');
    const shellTop = shell ? Math.round(shell.getBoundingClientRect().top) : null;
    const rootStyle = getComputedStyle(document.documentElement);

    const snapshot = {
      t: elapsed,
      label,
      frame: 'iframe',
      innerH: window.innerHeight,
      clientH: document.documentElement.clientHeight,
      vvH: vv ? Math.round(vv.height) : null,
      vvOffsetTop: vv ? Math.round(vv.offsetTop) : null,
      vvPageTop: vv ? Math.round(vv.pageTop) : null,
      vvScale: vv ? Number(vv.scale.toFixed(3)) : null,
      scrollY: Math.round(window.scrollY),
      shellTop,
      cssVh: rootStyle.getPropertyValue('--configurator-vh').trim() || null,
      cssVvTop: rootStyle.getPropertyValue('--configurator-vv-top').trim() || null,
    };

    const signature = `${snapshot.innerH}|${snapshot.clientH}|${snapshot.vvH}|${snapshot.vvOffsetTop}|${snapshot.scrollY}|${shellTop}`;
    if (label.startsWith('event:') && signature === lastSignature) return;
    lastSignature = signature;

    console.log(`[configurator-viewport] ${JSON.stringify(snapshot)}`);
  };
})();

const applyViewport = (traceLabel?: string) => {
  const { height, offsetTop } = readViewport();
  const root = document.documentElement;

  if (height > 0) {
    root.style.setProperty('--configurator-vh', `${Math.round(height)}px`);
  }

  // Only correct a real, transient shift. Sub-pixel noise and the legitimate
  // keyboard-open case (large offsetTop that should NOT be fought) are excluded.
  const shift = offsetTop > 1 && offsetTop < 160 ? Math.round(offsetTop) : 0;
  root.style.setProperty('--configurator-vv-top', `${shift}px`);

  if (traceLabel) {
    traceViewport(traceLabel);
  }
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
      // The correction is a cold-load-only workaround; once the user starts
      // scrolling, let the browser own the viewport entirely.
      document.documentElement.style.setProperty('--configurator-vv-top', '0px');
      traceViewport('touch:release');
    };

    const rafPin = () => {
      pinToTop();
      if (!userInteracted && Date.now() <= pinUntil) requestAnimationFrame(rafPin);
    };

    applyViewport('initial');
    requestAnimationFrame(() => applyViewport('raf'));
    // Some iOS builds only report the settled viewport one or two frames / a few
    // hundred ms after the chrome transition ends.
    const t1 = window.setTimeout(() => applyViewport('timer:150'), 150);
    const t2 = window.setTimeout(() => applyViewport('timer:400'), 400);
    const t3 = window.setTimeout(() => applyViewport('timer:900'), 900);
    const t4 = window.setTimeout(() => applyViewport('timer:2000'), 2000);
    requestAnimationFrame(rafPin);

    const onViewportChange = () => {
      applyViewport('event:vv-change');
    };
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        applyViewport('event:visible');
        extendPin();
      }
    };
    const onShow = () => {
      applyViewport('event:pageshow');
      window.setTimeout(() => applyViewport('event:pageshow+300'), 300);
      extendPin();
    };
    const onOrientation = () => {
      applyViewport('event:orientation');
      window.setTimeout(() => applyViewport('event:orientation+300'), 300);
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', onViewportChange);
      window.visualViewport.addEventListener('scroll', onViewportChange);
    } else {
      window.addEventListener('resize', onViewportChange);
    }

    window.addEventListener('scroll', pinToTop, { passive: true });
    window.addEventListener('touchstart', releasePin, { passive: true });
    window.addEventListener('wheel', releasePin, { passive: true });
    window.addEventListener('pageshow', onShow);
    window.addEventListener('orientationchange', onOrientation);
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onShow);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
      window.clearTimeout(t4);

      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', onViewportChange);
        window.visualViewport.removeEventListener('scroll', onViewportChange);
      } else {
        window.removeEventListener('resize', onViewportChange);
      }

      window.removeEventListener('scroll', pinToTop);
      window.removeEventListener('touchstart', releasePin);
      window.removeEventListener('wheel', releasePin);
      window.removeEventListener('pageshow', onShow);
      window.removeEventListener('orientationchange', onOrientation);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onShow);
    };
  }, []);

  return null;
};

export { EmbeddedViewportKickBridge };
