'use client';

import { useAppNavigate } from '@hooks/useAppNavigate';
import { useCallback } from 'react';
const useNavigateToConfigurator = () => {
  const { navigateToAppPath } = useAppNavigate();

  const navigateToConfigurator = useCallback(
    (slug: string) => {
      navigateToAppPath(`/${slug}`);
    },
    [navigateToAppPath],
  );

  return { navigateToConfigurator };
};

export { useNavigateToConfigurator };
