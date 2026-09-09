'use client';

import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import { animate, AnimatePresence, motion } from 'motion/react';

import { Text } from '@atoms';
import { SCROLL_HINT_SWIPE_DURATION, ScrollHintHandIcon } from '@molecules/ScrollHintTutorial/ScrollHintHandIcon';

import { SCROLL_HINT_CAPTION } from '@constants';
import { useScrollHintTutorialTrigger } from '@hooks';
import { useScrollHintTutorial } from '@store';

const HIGHLIGHT_PADDING = 8;
const HIGHLIGHT_RADIUS = 12;
const CAPTION_GAP = 16;
const BACKDROP_SPREAD = 9999;
const PREVIEW_SCROLL_DISTANCE = 28;
const AUTO_DISMISS_MS = 3_000;
const FADE = { duration: 0.28, ease: 'easeInOut' } as const;

type highlightRectType = {
  top: number;
  left: number;
  width: number;
  height: number;
};

const readHighlightRect = (element: HTMLElement): highlightRectType => {
  const { top, left, width, height } = element.getBoundingClientRect();

  return {
    top: top - HIGHLIGHT_PADDING,
    left: left - HIGHLIGHT_PADDING,
    width: width + HIGHLIGHT_PADDING * 2,
    height: height + HIGHLIGHT_PADDING * 2,
  };
};

const resolveScrollViewport = (element: HTMLElement): Element => element.querySelector('[data-overlayscrollbars-viewport]') ?? element;

const areRectsEqual = (a: highlightRectType | null, b: highlightRectType | null): boolean => {
  if (a === b) return true;
  if (!a || !b) return false;

  return a.top === b.top && a.left === b.left && a.width === b.width && a.height === b.height;
};

const ScrollHintTutorial = () => {
  useScrollHintTutorialTrigger();

  const isOpen = useScrollHintTutorial((state) => state.isOpen);
  const targetElement = useScrollHintTutorial((state) => state.targetElement);
  const dismissHint = useScrollHintTutorial((state) => state.dismissHint);
  const [highlight, setHighlight] = useState<highlightRectType | null>(null);

  useEffect(() => {
    if (!isOpen || !targetElement) return;

    const syncHighlight = () => {
      const nextRect = readHighlightRect(targetElement);
      setHighlight((currentRect) => (areRectsEqual(currentRect, nextRect) ? currentRect : nextRect));
    };

    const resizeObserver = new ResizeObserver(syncHighlight);
    resizeObserver.observe(targetElement);
    window.addEventListener('resize', syncHighlight);
    window.addEventListener('orientationchange', syncHighlight);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', syncHighlight);
      window.removeEventListener('orientationchange', syncHighlight);
    };
  }, [isOpen, targetElement]);

  useEffect(() => {
    if (!isOpen || !targetElement) return;

    const scrollViewport = resolveScrollViewport(targetElement);
    const maxScrollTop = scrollViewport.scrollHeight - scrollViewport.clientHeight;
    const distance = Math.min(PREVIEW_SCROLL_DISTANCE, maxScrollTop);

    const controls =
      distance > 0
        ? animate(0, distance, {
            duration: SCROLL_HINT_SWIPE_DURATION / 2,
            ease: 'easeInOut',
            repeat: Infinity,
            repeatType: 'reverse',
            onUpdate: (value) => {
              scrollViewport.scrollTop = value;
            },
          })
        : null;

    const releaseToUser = () => {
      controls?.stop();
      dismissHint();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') releaseToUser();
    };

    const autoDismissId = window.setTimeout(releaseToUser, AUTO_DISMISS_MS);

    window.addEventListener('keydown', onKeyDown);
    scrollViewport.addEventListener('touchmove', releaseToUser, { passive: true, once: true });

    return () => {
      controls?.stop();
      window.clearTimeout(autoDismissId);
      window.removeEventListener('keydown', onKeyDown);
      scrollViewport.removeEventListener('touchmove', releaseToUser);
    };
  }, [dismissHint, isOpen, targetElement]);

  const handleDismiss = useCallback(() => dismissHint(), [dismissHint]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence onExitComplete={() => setHighlight(null)}>
      {isOpen && highlight ? (
        <motion.section
          role="dialog"
          aria-modal="true"
          aria-label={SCROLL_HINT_CAPTION}
          className="fixed inset-0 z-60 sm:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={FADE}
          onClick={handleDismiss}
          onTouchStart={handleDismiss}
        >
          <section
            aria-hidden
            className="absolute border-2 border-white"
            style={{
              top: highlight.top,
              left: highlight.left,
              width: highlight.width,
              height: highlight.height,
              borderRadius: HIGHLIGHT_RADIUS,
              boxShadow: `0 0 0 ${BACKDROP_SPREAD}px rgb(0 0 0 / 0.7)`,
            }}
          />

          <motion.section
            className="pointer-events-none absolute flex flex-col items-center justify-end"
            style={{ top: 0, left: highlight.left, width: highlight.width, height: Math.max(highlight.top - CAPTION_GAP, 0) }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ ...FADE, delay: 0.1 }}
          >
            <section className="flex flex-col items-center gap-2 rounded-xl bg-black/60 px-5 py-4 text-white">
              <ScrollHintHandIcon className="text-white" />
              <Text className="max-w-60 text-center text-[14px] leading-[1.35] font-medium text-white">{SCROLL_HINT_CAPTION}</Text>
            </section>
          </motion.section>
        </motion.section>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
};

export { ScrollHintTutorial };
