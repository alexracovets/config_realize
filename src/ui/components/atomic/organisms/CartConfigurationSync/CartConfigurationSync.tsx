'use client';

import { useConfigurationCartSync, useConfigurationHistoryHotkeys, useConfigurationHistoryTracker } from '@hooks';

const CartConfigurationSync = () => {
  useConfigurationCartSync();
  useConfigurationHistoryTracker();
  useConfigurationHistoryHotkeys();

  return null;
};

export { CartConfigurationSync };
