'use client';

import { Slot } from '@radix-ui/react-slot';

import { cva } from 'class-variance-authority';

import { cn } from '@utils';
import type { boxPropsType } from '@types';

const variantBox = cva('block', {
  variants: {
    variant: {
      default: '',
      header: 'bg-white py-5',
      footer: 'bg-white py-15',
      toggle_handle: cn(
        'absolute left-0 top-[1px] w-4 h-4 bg-white rounded-full shadow transition-transform translate-x-0.5',
        'data-[active=true]:translate-x-5',
        'transition-all duration-200 ease-in',
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
