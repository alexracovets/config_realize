'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

const useAppNavigate = () => {
  const router = useRouter();

  const navigateToAppPath = useCallback(
    (pathname: string) => {
      router.push(pathname);
    },
    [router],
  );

  const toAppPath = useCallback((pathname: string) => pathname, []);

  return { navigateToAppPath, toAppPath };
};

export { useAppNavigate };
