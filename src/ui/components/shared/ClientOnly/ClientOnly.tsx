'use client';

import { useEffect, useState, type ReactNode } from 'react';

type clientOnlyPropsType = {
  children: ReactNode;
  fallback?: ReactNode;
};

const ClientOnly = ({ children, fallback = null }: clientOnlyPropsType) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export { ClientOnly };
