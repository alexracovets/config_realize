'use client';

import { useAppNavigate } from '@hooks/useAppNavigate';
import { buildConfiguratorPath } from '@utils';
import { useCallback } from 'react';

const useNavigateToConfigurator = () => {
  const { navigateToAppPath } = useAppNavigate();

  const navigateToConfigurator = useCallback(
    (collectionHandle: string, slug: string) => {
      navigateToAppPath(buildConfiguratorPath(collectionHandle, slug));
    },
    [navigateToAppPath],
  );

  return { navigateToConfigurator };
};

export { useNavigateToConfigurator };
