'use client';

import { useEffect } from 'react';

// On an iOS in-app-browser cold load WebKit hands the page a viewport shorter than
// the screen and never sends the resize that would correct it. This bridge writes
// --configurator-vh so the shell is sized against the real height rather than that
// short layout viewport; globals.css falls back to 100% until the first
// measurement lands.
//
// iOS = iPhone/iPod, and iPadOS which reports as Mac but has touch. The
// screen.availHeight fallback below is iOS-only; on desktop the inner/screen gap
// is just browser UI and must be left alone.
const IS_IOS =
  typeof navigator !== 'undefined' &&
  (/iP(hone|od|ad)/.test(navigator.platform || '') ||
    /iP(hone|od|ad)/.test(navigator.userAgent || '') ||
    (navigator.platform === 'MacIntel' && (navigator.maxTouchPoints || 0) > 1));

const readViewport = () => {
  const vv = window.visualViewport;
  const vpH = vv ? Math.round(vv.height) : window.innerHeight;
  const screenH = window.screen?.availHeight ?? 0;
  const clientH = document.documentElement.clientHeight;

  // Default: trust the live viewport (visualViewport tracks the iOS chrome on a
  // normal load — even when it is shorter than the screen because the address bar
  // is genuinely there).
  let height = vpH;

  // Exception — the *frozen* iOS in-app browser cold load. Its signature is that
  // window.innerHeight and documentElement.clientHeight DISAGREE (observed 896 vs
  // 720). A normal chrome-showing load has innerHeight === clientHeight (e.g.
  // 699/699) and must be left alone — using the screen height there makes the
  // shell taller than the viewport and it scrolls under the chrome.
  const isFrozenViewport = IS_IOS && Math.abs(window.innerHeight - clientH) > 40 && screenH - vpH > 60;

  if (isFrozenViewport) {
    height = screenH;
  }

  if (!(height > 120 && height < 4000)) {
    height = window.innerHeight;
  }

  return { height };
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
  let lastSignature = '';

  return (label: string) => {
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
        'right:4px',
        'bottom:4px',
        'z-index:2147483647',
        'padding:5px 7px',
        'font:11px/1.35 ui-monospace,SFMono-Regular,Menlo,monospace',
        'color:#0ff',
        'background:#000',
        'border:1px solid #0ff',
        'border-radius:4px',
        'white-space:pre',
        'text-align:left',
        'pointer-events:auto',
      ].join(';'),
    );

    node.textContent = [
      `IFRAME ${snapshot.label} onCfg=${snapshot.onConfigurator === 'yes' ? 'Y' : 'N'} sc=${snapshot.vvScale}`,
      `inner ${snapshot.innerH}  client ${snapshot.clientH}  vvH ${snapshot.vvH}`,
      `--vh ${snapshot.cssVh}  --shellH ${snapshot.cssShellH}`,
      `docElTop ${snapshot.docElTop}  scrollY ${snapshot.scrollY}`,
      `shell ${snapshot.shellTH}  cssH ${snapshot.shellCssH}`,
      `logo ${snapshot.logoRowTH}  steps ${snapshot.stepHeaderTH}`,
      `main ${snapshot.mainTH}  foot ${snapshot.footerTH}`,
    ].join('\n');
  };
})();

let lastVh = 0;

const applyViewport = (traceLabel?: string) => {
  const { height } = readViewport();
  const root = document.documentElement;

  // Grow freely; shrink only on a deliberate, sustained change (real rotation to a
  // shorter viewport) — a transient dip (keyboard, momentary chrome) must not yank
  // the layout.
  if (height > 120 && (height > lastVh || height < lastVh - 60)) {
    lastVh = height;
    root.style.setProperty('--configurator-vh', `${Math.round(height)}px`);
  }

  if (traceLabel) {
    traceViewport(traceLabel);
  }
};

// Always-on viewport monitor. Unlike the pin-to-top loop below (iframe only), this
// is NOT gated on the embedded session: --configurator-vh / --configurator-vv-top
// are written everywhere so the values are observable on a direct localhost /
// preview visit and inside DevTools device mode too. Outside an iframe the writes
// are inert (--vh == the height 100dvh would resolve to, --vvTop == 0). Samples
// repeatedly for the first ~9s (the iframe can take a couple of seconds to boot,
// and the shift shows up late) then on every viewport event. DELETE this hook and
// its render once the shift is diagnosed.
const useViewportDebugMonitor = () => {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const sample = (label: string) => applyViewport(label);

    sample('initial');
    const raf = requestAnimationFrame(() => sample('raf'));
    const timers = [150, 400, 900, 1500, 2500, 4000, 6000, 9000].map((ms) => window.setTimeout(() => sample(`timer:${ms}`), ms));

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

const EmbeddedViewportKickBridge = () => {
  // Writes --configurator-vh and drives the HUD.
  useViewportDebugMonitor();

  return null;
};

export { EmbeddedViewportKickBridge };
