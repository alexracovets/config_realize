'use client';

import { useEffect, useRef } from 'react';

import { animate } from 'motion/react';

// Reproduces the Shopify header "magnet" hover effect (theme.js MagnetButton):
// on mousemove the element eases toward the pointer by up to `strength`px with a
// spring, and returns to 0,0 on mouseleave. Pointer devices only.
const useMagnet = <T extends HTMLElement>(strength = 10) => {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(pointer: coarse)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const onMove = (event: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / el.offsetWidth - 0.5) * strength;
      const y = ((event.clientY - rect.top) / el.offsetHeight - 0.5) * strength;
      animate(el, { x, y }, { duration: 1.5, ease: [0.16, 1, 0.3, 1] });
    };

    const onLeave = () => {
      animate(el, { x: 0, y: 0 }, { duration: 1.5, ease: [0.16, 1, 0.3, 1] });
    };

    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);

    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, [strength]);

  return ref;
};

export { useMagnet };
