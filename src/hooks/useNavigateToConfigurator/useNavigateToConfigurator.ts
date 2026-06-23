'use client';

import { useCallback } from 'react';

import { useAppNavigate } from '../useAppNavigate';

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
