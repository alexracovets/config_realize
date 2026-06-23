'use client';

import { useLayoutEffect, useRef } from 'react';

import { buildLoaderWavePath, WAVE_SPEED } from './buildLoaderWavePath';

const supportsOffscreenCanvas = () => typeof OffscreenCanvas !== 'undefined';

const startSvgWaveAnimation = (path: SVGPathElement) => {
  let frame = 0;
  const start = performance.now();

  const tick = (now: number) => {
    path.setAttribute('d', buildLoaderWavePath((now - start) * WAVE_SPEED));
    frame = requestAnimationFrame(tick);
  };

  frame = requestAnimationFrame(tick);

  return () => cancelAnimationFrame(frame);
};

const MainLoaderBackground = () => {
  const hostRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  useLayoutEffect(() => {
    const host = hostRef.current;
    const path = pathRef.current;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      path?.setAttribute('d', buildLoaderWavePath(0));
      return;
    }

    if (!path) return;

    if (!supportsOffscreenCanvas() || !host) {
      return startSvgWaveAnimation(path);
    }

    const svg = path.parentElement;
    const canvas = document.createElement('canvas');
    canvas.className = 'absolute inset-0 hidden h-full w-full';
    canvas.setAttribute('aria-hidden', 'true');
    host.insertBefore(canvas, host.firstChild);

    let offscreen: OffscreenCanvas;

    try {
      offscreen = canvas.transferControlToOffscreen();
    } catch {
      canvas.remove();
      return startSvgWaveAnimation(path);
    }

    const worker = new Worker(new URL('./loaderWave.worker.ts', import.meta.url), { type: 'module' });

    const postSize = (width: number, height: number) => {
      worker.postMessage({
        type: 'resize',
        width,
        height,
        devicePixelRatio: window.devicePixelRatio,
      });
    };

    const onWorkerMessage = (event: MessageEvent<{ type: string }>) => {
      if (event.data.type !== 'ready') return;
      canvas.classList.remove('hidden');
      svg?.classList.add('hidden');
    };

    worker.addEventListener('message', onWorkerMessage);

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      postSize(entry.contentRect.width, entry.contentRect.height);
    });

    resizeObserver.observe(host);

    const { width, height } = host.getBoundingClientRect();

    worker.postMessage(
      {
        type: 'init',
        canvas: offscreen,
        width,
        height,
        devicePixelRatio: window.devicePixelRatio,
      },
      [offscreen],
    );

    return () => {
      resizeObserver.disconnect();
      worker.removeEventListener('message', onWorkerMessage);
      worker.postMessage({ type: 'stop' });
      worker.terminate();
      canvas.remove();
      svg?.classList.remove('hidden');
    };
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden bg-[#ececec]" aria-hidden>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_36%,#fafafa_0%,transparent_68%)]" />

      <div ref={hostRef} className="absolute inset-[-12%]">
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
          <path ref={pathRef} d={buildLoaderWavePath(0)} fill="#d2d2d2" />
        </svg>
      </div>

      <div className="absolute inset-x-0 top-0 h-[38%] bg-[linear-gradient(to_bottom,#ffffff_0%,#ffffff_12%,rgba(255,255,255,0.92)_22%,transparent_100%)]" />
    </div>
  );
};

export { MainLoaderBackground };
