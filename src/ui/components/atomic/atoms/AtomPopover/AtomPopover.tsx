'use client';

import { cva, type VariantProps } from 'class-variance-authority';

import { Popover, PopoverClose, PopoverContent, type PopoverContentProps, PopoverPortal, PopoverTrigger } from '@shared';
import { cn } from '@utils';

const popoverContentVariants = cva('z-50 rounded-xl border border-gray-30 shadow-lg outline-none', {
  variants: {
    variant: {
      default: 'bg-white',
      color_picker: 'flex w-auto flex-col items-center justify-center gap-4 bg-white p-4 max-sm:max-w-[calc(100vw-32px)]',
    },
    gap: {
      default: '',
      sm: 'flex flex-col gap-3',
      lg: 'flex flex-col gap-6',
    },
  },
  defaultVariants: {
    variant: 'default',
    gap: 'default',
  },
});

type AtomPopoverContentProps = PopoverContentProps &
  VariantProps<typeof popoverContentVariants> & {
    className?: string;
  };

const AtomPopoverContent = ({ className, variant, gap, align = 'start', sideOffset = 8, ...props }: AtomPopoverContentProps) => {
  return (
    <PopoverPortal>
      <PopoverContent align={align} sideOffset={sideOffset} className={cn(popoverContentVariants({ variant, gap }), className)} {...props} />
    </PopoverPortal>
  );
};

export { Popover as AtomPopover, PopoverClose as AtomPopoverClose, AtomPopoverContent, PopoverTrigger as AtomPopoverTrigger };
