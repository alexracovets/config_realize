'use client';

import { forwardRef } from 'react';

import { SvgIcon } from '@atoms';
import type { productSessionAddButtonPropsType } from '@types';
import { cn } from '@utils';

const ProductSessionAddButton = forwardRef<HTMLButtonElement, productSessionAddButtonPropsType>(({ className, ...props }, ref) => {
  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        'flex h-12 w-15 items-center justify-center border border-gray-10 bg-gray-5 cursor-pointer',
        'transition-colors duration-200 hover:shadow-md hover:border-active',
        'max-sm:h-11 max-sm:w-12',
        className,
      )}
      aria-label="Aggiungi prodotto"
      {...props}
    >
      <SvgIcon name="plus" className="size-6" />
    </button>
  );
});

ProductSessionAddButton.displayName = 'ProductSessionAddButton';

export { ProductSessionAddButton };
