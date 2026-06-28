'use client';

import { type ReactNode, useSyncExternalStore } from 'react';

type clientOnlyPropsType = {
  children: ReactNode;
  fallback?: ReactNode;
};

const subscribe = () => () => {};

const getClientSnapshot = () => true;

const getServerSnapshot = () => false;

const ClientOnly = ({ children, fallback = null }: clientOnlyPropsType) => {
  const mounted = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);

  if (!mounted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export { ClientOnly };
