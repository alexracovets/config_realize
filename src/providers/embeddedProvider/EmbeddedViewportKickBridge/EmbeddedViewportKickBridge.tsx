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

/** "top×height" of the first element matching `selector`, or "-" when absent. */
const rectTH = (selector: string): string => {
  const el = document.querySelector(selector);
  if (!el) return '-';
  const r = el.getBoundingClientRect();
  return `${Math.round(r.top)}×${Math.round(r.height)}`;
};

// Diagnostic trace for the iOS two-viewport cold-load shift, from INSIDE the frame.
// Captures the full height chain: layout viewport, visual viewport, document
// scroll/overflow (documentElement.top !== 0 means the frame doc itself is
// scrolled — the thing a reload fixes), then the box (top×height) of every link in
// the render tree — .configurator-shell (+ computed height + transform, to see if
// the translateY correction actually applied), .configurator-shell-background, the
// store <Header> logo row, the step-tab header (HeaderConfiguration — the dashed
// line), the <main> canvas, and the footer — plus the two CSS vars. `t` is
// wall-clock so it lines up with the host HUD. Runs ~6s after load, then stops.
const traceViewport = (() => {
  const TRACE_WINDOW_MS = 6000;
  const START = performance.now();
  let lastSignature = '';

  return (label: string) => {
    if (performance.now() - START > TRACE_WINDOW_MS) return;

    const vv = window.visualViewport;
    const de = document.documentElement;
    const rootStyle = getComputedStyle(de);
    const shellEl = document.querySelector('.configurator-shell');
    const shellCS = shellEl ? getComputedStyle(shellEl) : null;

    const snapshot = {
      t: Math.round(performance.timeOrigin + performance.now()),
      label,
      frame: 'iframe',
      // The configurator layout only renders on /[collection]/[slug]; on any other
      // route (landing, catalog) .configurator-shell and the data-dbg hooks are
      // absent, so every T×H below reads "-". This flag says which case you see.
      onConfigurator: shellEl ? 'yes' : 'NO (not on configurator route)',
      innerH: window.innerHeight,
      clientH: de.clientHeight,
      vvH: vv ? Math.round(vv.height) : null,
      vvOffsetTop: vv ? Math.round(vv.offsetTop) : null,
      vvPageTop: vv ? Math.round(vv.pageTop) : null,
      vvScale: vv ? Number(vv.scale.toFixed(3)) : null,
      scrollY: Math.round(window.scrollY),
      docElTop: Math.round(de.getBoundingClientRect().top),
      docScrollH: de.scrollHeight,
      // render-tree boxes, top→bottom (data-dbg hooks set in ConfiguratorLayoutTemplate)
      shellTH: rectTH('.configurator-shell'),
      shellCssH: shellCS ? shellCS.height : null,
      shellXfrm: shellCS && shellCS.transform !== 'none' ? shellCS.transform : null,
      bgTH: rectTH('[data-dbg="bg"]'),
      gridTH: rectTH('[data-dbg="grid"]'),
      logoRowTH: rectTH('.configurator-shell > header'),
      stepHeaderTH: rectTH('[data-dbg="grid"] > header'),
      mainTH: rectTH('[data-dbg="main"]'),
      footerTH: rectTH('[data-dbg="grid"] > :last-child'),
      cssVh: rootStyle.getPropertyValue('--configurator-vh').trim() || null,
      cssVvTop: rootStyle.getPropertyValue('--configurator-vv-top').trim() || null,
      cssShellH: rootStyle.getPropertyValue('--configurator-shell-height').trim() || null,
    };

    const signature = [snapshot.innerH, snapshot.vvH, snapshot.vvOffsetTop, snapshot.scrollY, snapshot.docElTop, snapshot.shellTH, snapshot.logoRowTH, snapshot.stepHeaderTH, snapshot.footerTH].join('|');
    if (label.startsWith('event:') && signature === lastSignature) return;
    lastSignature = signature;

    console.log(`[configurator-viewport] ${JSON.stringify(snapshot)}`);
    updateViewportHud(snapshot);
  };
})();

// On-screen debug HUD for phones, where nobody opens the console. A fixed panel in
// the BOTTOM-LEFT corner (the host HUD takes top-left) with the full height chain
// from inside the frame. Always visible while debugging — no dismiss. Remove this +
// its call site once confirmed on device.
type ViewportHudSnapshot = {
  t: number;
  label: string;
  onConfigurator: string;
  innerH: number;
  clientH: number;
  vvH: number | null;
  vvOffsetTop: number | null;
  vvPageTop: number | null;
  vvScale: number | null;
  scrollY: number;
  docElTop: number;
  docScrollH: number;
  shellTH: string;
  shellCssH: string | null;
  shellXfrm: string | null;
  bgTH: string;
  gridTH: string;
  logoRowTH: string;
  stepHeaderTH: string;
  mainTH: string;
  footerTH: string;
  cssVh: string | null;
  cssVvTop: string | null;
  cssShellH: string | null;
};

const HUD_ID = 'configurator-viewport-hud-iframe';

const updateViewportHud = (() => {
  let node: HTMLElement | null = null;

  return (snapshot: ViewportHudSnapshot) => {
    if (typeof document === 'undefined' || !document.body) return;

    // On HMR the closure resets but the previous DOM node lingers — drop every
    // stale copy so panels never stack, then (re)create a single fresh one.
    if (!node) {
      document.querySelectorAll(`#${HUD_ID}`).forEach((n) => n.remove());
      node = document.createElement('div');
      node.id = HUD_ID;
      document.body.appendChild(node);
    }

    node.setAttribute(
      'style',
      [
        'position:fixed',
        'bottom:2px',
        'left:2px',
        'z-index:2147483647',
        'padding:3px 5px',
        'font:8px/1.2 ui-monospace,SFMono-Regular,Menlo,monospace',
        'color:#0ff',
        'background:rgba(0,0,0,0.72)',
        'border:1px solid #0ff',
        'border-radius:4px',
        'white-space:pre',
        'pointer-events:auto',
      ].join(';'),
    );

    node.textContent = [
      `IFRAME  t=${snapshot.t} ${snapshot.label}`,
      `onConfigurator ${snapshot.onConfigurator}`,
      `inner/client ${snapshot.innerH}/${snapshot.clientH}`,
      `vvH ${snapshot.vvH}  vvOffTop ${snapshot.vvOffsetTop}  sc ${snapshot.vvScale}`,
      `scrollY ${snapshot.scrollY}  docElTop ${snapshot.docElTop}  docScrH ${snapshot.docScrollH}`,
      `shell  ${snapshot.shellTH}  csH ${snapshot.shellCssH}`,
      `shell xfm ${snapshot.shellXfrm}`,
      `bg    ${snapshot.bgTH}`,
      `grid  ${snapshot.gridTH}`,
      `logo  ${snapshot.logoRowTH}`,
      `steps ${snapshot.stepHeaderTH}`,
      `main  ${snapshot.mainTH}`,
      `foot  ${snapshot.footerTH}`,
      `--vh ${snapshot.cssVh}  --vvTop ${snapshot.cssVvTop}`,
      `--shellH ${snapshot.cssShellH}`,
      '(T×H = top×height)',
    ].join('\n');
  };
})();

const applyViewport = (traceLabel?: string) => {
  const { height, offsetTop } = readViewport();
  const root = document.documentElement;

  // Ignore a collapsed viewport (tab switch / frame hidden momentarily reports
  // ~0-1px). Keeping the last good value avoids a 1px shell flash.
  if (height > 120) {
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

// Always-on viewport monitor. Unlike the pin-to-top loop below (iframe only), this
// is NOT gated on the embedded session: --configurator-vh / --configurator-vv-top
// are written everywhere so the values are observable on a direct localhost /
// preview visit and inside DevTools device mode too. Outside an iframe the writes
// are inert (--vh == the height 100dvh would resolve to, --vvTop == 0). Emits the
// phase trace (initial, settle timers, viewport events, orientation, first touch)
// for ~6s after load. DELETE this hook and its render once the shift is diagnosed.
const useViewportDebugMonitor = () => {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const sample = (label: string) => applyViewport(label);

    sample('initial');
    const raf = requestAnimationFrame(() => sample('raf'));
    const timers = [
      window.setTimeout(() => sample('timer:150'), 150),
      window.setTimeout(() => sample('timer:400'), 400),
      window.setTimeout(() => sample('timer:900'), 900),
      window.setTimeout(() => sample('timer:2000'), 2000),
      window.setTimeout(() => sample('timer:4000'), 4000),
    ];

    const onVvChange = () => sample('event:vv-change');
    const onWinResize = () => sample('event:window-resize');
    const onScroll = () => sample('event:scroll');
    const onOrientation = () => {
      sample('event:orientation');
      window.setTimeout(() => sample('event:orientation+300'), 300);
    };
    const onPageShow = () => sample('event:pageshow');
    const onTouch = () => sample('event:touch');

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', onVvChange);
      window.visualViewport.addEventListener('scroll', onVvChange);
    }
    window.addEventListener('resize', onWinResize);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('orientationchange', onOrientation);
    window.addEventListener('pageshow', onPageShow);
    window.addEventListener('touchstart', onTouch, { passive: true, once: true });

    return () => {
      cancelAnimationFrame(raf);
      timers.forEach(window.clearTimeout);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', onVvChange);
        window.visualViewport.removeEventListener('scroll', onVvChange);
      }
      window.removeEventListener('resize', onWinResize);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('orientationchange', onOrientation);
      window.removeEventListener('pageshow', onPageShow);
      window.removeEventListener('touchstart', onTouch);
    };
  }, []);
};

const PIN_WINDOW_MS = 4000;

const EmbeddedViewportKickBridge = () => {
  // Writes --configurator-vh / --configurator-vv-top and drives the HUD, on every
  // context (not just embedded) so the values are observable while debugging.
  useViewportDebugMonitor();

  // Embedded-only: hold the frame scrolled to the top through the cold-load
  // window, and re-run applyViewport on the events coupled to that hold. The
  // monitor above already covers the plain timers/events.
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
      applyViewport('event:extend-pin');
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

    requestAnimationFrame(rafPin);

    const onVisible = () => {
      if (document.visibilityState === 'visible') extendPin();
    };
    const onShow = () => {
      extendPin();
      window.setTimeout(() => applyViewport('event:pageshow+300'), 300);
    };

    window.addEventListener('scroll', pinToTop, { passive: true });
    window.addEventListener('touchstart', releasePin, { passive: true });
    window.addEventListener('wheel', releasePin, { passive: true });
    window.addEventListener('pageshow', onShow);
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onShow);

    return () => {
      window.removeEventListener('scroll', pinToTop);
      window.removeEventListener('touchstart', releasePin);
      window.removeEventListener('wheel', releasePin);
      window.removeEventListener('pageshow', onShow);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onShow);
    };
  }, []);

  return null;
};

export { EmbeddedViewportKickBridge };
