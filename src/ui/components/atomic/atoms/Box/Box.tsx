'use client';

import { Slot } from '@radix-ui/react-slot';

import { cva } from 'class-variance-authority';

import { cn } from '@utils';
import type { boxPropsType } from '@types';

const variantBox = cva('block', {
  variants: {
    variant: {
      default: '',
      header: cn('bg-white py-5', 'max-sm:py-3'),
      footer: 'bg-white py-15',
      toggle_handle: cn(
        'absolute left-0 top-[1px] w-4 h-4 bg-white rounded-full shadow transition-transform translate-x-0.5',
        'data-[active=true]:translate-x-5',
        'transition-all duration-200 ease-in',
      ),
      aside_configuration: cn(
        'relative h-full min-h-0 overflow-visible p-4 pl-16',
        'max-sm:col-start-1 max-sm:col-span-3 max-sm:row-start-2 max-sm:flex max-sm:min-h-0 max-sm:w-full max-sm:flex-col max-sm:p-4 max-sm:pl-4 max-sm:pb-0',
      ),
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

const Box = ({ variant = 'default', asChild = false, className, children, style, ...props }: boxPropsType) => {
  const Component = asChild ? Slot : 'div';

  return (
    <Component className={cn(variantBox({ variant, className }))} {...props} style={style}>
      {children}
    </Component>
  );
};

export { Box };
