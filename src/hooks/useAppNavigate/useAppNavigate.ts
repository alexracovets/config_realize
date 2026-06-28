'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

import { buildAppPath } from '@utils';

const useAppNavigate = () => {
  const router = useRouter();

  const navigateToAppPath = useCallback(
    (pathname: string) => {
      router.push(buildAppPath(pathname));
    },
    [router],
  );

  const toAppPath = useCallback((pathname: string) => buildAppPath(pathname), []);

  return { navigateToAppPath, toAppPath };
};

export { useAppNavigate };
