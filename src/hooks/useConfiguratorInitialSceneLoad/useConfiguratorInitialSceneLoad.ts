'use client';

import { useEffect } from 'react';

import { warmProductGltfCache } from '@configurator';
import { useConfiguratorSceneLoad } from '@store';

const observeLongTasksForPageLifetime = (): (() => void) => {
  if (process.env.NODE_ENV === 'production') return () => {};
  if (typeof PerformanceObserver === 'undefined') return () => {};
  if (!PerformanceObserver.supportedEntryTypes?.includes('longtask')) return () => {};

  const startedAt = performance.now();
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      console.warn(`[longtask] ${entry.duration.toFixed(0)}ms blocking task at +${(entry.startTime - startedAt).toFixed(0)}ms since page mount`);
    }
  });

  try {
    observer.observe({ entryTypes: ['longtask'] });
  } catch {
    return () => {};
  }

  return () => observer.disconnect();
};

const useConfiguratorInitialSceneLoad = () => {
  useEffect(() => {
    const stopObserving = observeLongTasksForPageLifetime();
    useConfiguratorSceneLoad.getState().beginInitialSceneLoad();
    warmProductGltfCache();

    return stopObserving;
  }, []);
};

export { useConfiguratorInitialSceneLoad };
