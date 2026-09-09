'use client';

import { useEffect } from 'react';

import { useConfiguratorSceneLoad, useScrollHintTutorial } from '@store';

const SCROLL_HINT_MOBILE_MEDIA_QUERY = '(max-width: 639px)';
const SCROLL_HINT_APPEAR_DELAY_MS = 600;

const useScrollHintTutorialTrigger = () => {
  const isInitialSceneLoading = useConfiguratorSceneLoad((state) => state.isInitialSceneLoading);
  const targetElement = useScrollHintTutorial((state) => state.targetElement);
  const wasSeen = useScrollHintTutorial((state) => state.wasSeen);
  const openHint = useScrollHintTutorial((state) => state.openHint);

  useEffect(() => {
    if (isInitialSceneLoading || wasSeen || !targetElement) return;
    if (typeof window.matchMedia !== 'function' || !window.matchMedia(SCROLL_HINT_MOBILE_MEDIA_QUERY).matches) return;

    const timeoutId = window.setTimeout(() => {
      const scrollViewport = targetElement.querySelector('[data-overlayscrollbars-viewport]') ?? targetElement;
      if (scrollViewport.scrollHeight <= scrollViewport.clientHeight + 1) return;

      openHint();
    }, SCROLL_HINT_APPEAR_DELAY_MS);

    return () => window.clearTimeout(timeoutId);
  }, [isInitialSceneLoading, openHint, targetElement, wasSeen]);
};

export { useScrollHintTutorialTrigger };
