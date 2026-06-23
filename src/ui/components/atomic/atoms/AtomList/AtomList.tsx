'use client';

import { cva } from 'class-variance-authority';

import { cn } from '@utils';
import type { atomListPropsType } from '@types';

const atomListWrapperVariants = cva('flex w-full flex-col', {
  variants: {
    variant: {
      default: 'gap-1',
      faq: 'gap-1',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

const AtomList = ({ items, icon, variant, wrapperClassName, itemClassName, iconClassName, contentClassName }: atomListPropsType) => {
  return (
    <ul className={cn(atomListWrapperVariants({ variant }), wrapperClassName)}>
      {items.map((item, index) => (
        <li key={index} className={cn('flex items-start gap-2', itemClassName)}>
          {icon ? <span className={cn('shrink-0 text-[18px] mt-0.5', iconClassName)}>{icon}</span> : null}
          <span className={cn('min-w-0 flex-1', contentClassName)}>{item}</span>
        </li>
      ))}
    </ul>
  );
};

export { AtomList, atomListWrapperVariants };
