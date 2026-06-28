'use client';

import type { ReactNode } from 'react';

import { LuDot } from 'react-icons/lu';
import { RxExclamationCircled } from 'react-icons/rx';

const ModalInfoListIcon = ({ icon = 'faq' }: { icon?: 'dash' | 'dot' | 'faq' }): ReactNode => {
  if (icon === 'dash') {
    return <span aria-hidden className="mt-[9px] block h-px w-2.5 shrink-0 bg-default" />;
  }

  if (icon === 'dot') {
    return <LuDot aria-hidden className="size-5 shrink-0 text-default" />;
  }

  return <RxExclamationCircled aria-hidden className="size-5 shrink-0 text-default" />;
};

export { ModalInfoListIcon };
