'use client';

import { Button as ButtonPrimitive } from '@base-ui/react/button';

import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@utils';

const buttonVariants = cva(
  cn(
    'cursor-pointer group/button inline-flex shrink-0 whitespace-nowrap',
    'border border-transparent',
    'focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-active',
    'active:not-aria-[haspopup]:translate-y-px',
    'disabled:pointer-events-none disabled:opacity-50',
    'aria-invalid:border-red aria-invalid:ring-1 aria-invalid:ring-active',
    'transition-all duration-200 ease-in',
  ),
  {
    variants: {
      variant: {
        default: 'flex items-center justify-center font-semibold bg-primary-button hover:bg-primary-button/80',
        center: 'flex items-center justify-center font-semibold bg-primary-button hover:bg-primary-button/80',
        primary: cn(
          'relative overflow-hidden',
          'text-white! border-none flex items-center justify-center font-semibold',
          'bg-linear-to-r from-[#ECD187] via-[#DC2C6F] to-[#030102]',
          "before:pointer-events-none before:absolute before:inset-0 before:z-0 before:content-[''] before:bg-[#DC2C6F]",
          'before:opacity-0 before:transition-opacity before:duration-300 before:ease-in-out',
          'hover:before:opacity-100',
        ),
        outline: 'bg-white',
        secondary: '',
        ghost: '',
        select_part: cn(
          'w-full h-[80px] rounded-[8px] border-[2px] border-gray-200 shadow-sm overflow-hidden',
          'data-[active=true]:border-active hover:border-active data-[active=true]:shadow-md hover:shadow-md',
          'transition-all duration-200 ease-in',
        ),
        select_part_short: cn(
          'w-full h-[60px] rounded-[8px] border-[1px] border-transparent shadow-sm',
          'data-[active=true]:border-gray-30 hover:border-gray-30 data-[active=true]:shadow-md hover:shadow-md',
          'transition-all duration-200 ease-in',
        ),
        select_none: cn(
          'text-[11px] color-default rounded-[8px]',
          'flex flex-col items-center justify-center w-full h-[80px] gap-1',
          'bg-gray-100 border-[2px] border-gray-200',
          'data-[active=true]:border-active hover:border-active',
          'transition-all duration-200 ease-in',
        ),
        destructive: cn(
          'text-[14px] leading-[16px] font-semibold text-default gap-2 items-center',
          'hover:text-active',
          '[&_span]:underline underline-offset-4',
          '[&_svg]:size-4 [&_svg]:shrink-0',
          'transition-all duration-200 ease-in',
        ),
        link: '',
        toggle: cn(
          'relative w-10 h-5 rounded-full transition-colors cursor-pointer shrink-0 bg-gray-300',
          'data-[active=true]:bg-black',
          'transition-all duration-200 ease-in',
        ),
        delete: cn(
          'text-[12px] leading-[15px] font-semibold text-white gap-2 items-center bg-error',
          'hover:bg-error/80',
          '[&_svg]:size-4 [&_svg]:shrink-0',
          'transition-all duration-200 ease-in',
        ),
        upload: cn(
          'flex-col w-full p-2 rounded-[8px] border-dashed border-gray-30 gap-2 items-center bg-white',
          '[&_svg]:w-[15px] [&_svg]:h-[16px] [&_svg]:shrink-0',
          'hover:bg-gray-100 hover:shadow-sm',
          'transition-all duration-200 ease-in',
        ),
      },
      size: {
        default: '',
        xs: 'py-1.5 px-2.5 text-[14px] leading-[15px] rounded-[8px] gap-2 h-[31px]',
        sm: 'py-3 px-4 text-4 leading-4 rounded-[8px] gap-2 h-10',
        lg: '',
        icon: 'p-1 rounded-sm',
        'icon-xs': '',
        'icon-sm': '',
        'icon-lg': '',
        delete: 'px-2 h-[28.5px] rounded-[8px]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

const Button = ({ className, variant = 'default', size = 'default', children, ...props }: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) => {
  const content = variant === 'primary' ? <span className="relative z-10 inline-flex items-center gap-2">{children}</span> : children;

  return (
    <ButtonPrimitive data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props}>
      {content}
    </ButtonPrimitive>
  );
};

export { Button };
