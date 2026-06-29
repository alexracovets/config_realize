'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

import { buildAppPath, isEmbeddedSession, isInternalAppPath } from '@utils';
import { postEmbeddedUrlToParent } from '@utils/embeddedUrlSync';

const useAppNavigate = () => {
  const router = useRouter();

  const navigateToAppPath = useCallback(
    (pathname: string) => {
      router.push(buildAppPath(pathname));

      if (isEmbeddedSession() && !isInternalAppPath(pathname)) {
        postEmbeddedUrlToParent(pathname);
      }
    },
    [router],
  );

  const toAppPath = useCallback((pathname: string) => buildAppPath(pathname), []);

  return { navigateToAppPath, toAppPath };
};

export { useAppNavigate };
