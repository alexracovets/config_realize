import type { ReactNode } from 'react';

type embeddedContextType = {
  embedded: boolean;
  shop: string | null;
  host: string | null;
};

type embeddedProviderPropsType = {
  children: ReactNode;
};

export type { embeddedContextType, embeddedProviderPropsType };
