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
        ghost: 'bg-white',
        select_part: cn(
          'w-full h-[80px] rounded-[8px] border-[2px] border-gray-200 shadow-sm overflow-hidden',
          'max-xl:h-16',
          'data-[active=true]:border-active hover:border-active data-[active=true]:shadow-md hover:shadow-md',
          'transition-all duration-200 ease-in',
        ),
        select_part_short: cn(
          'w-full h-[60px] rounded-[8px] border-[1px] border-transparent shadow-sm',
          'max-xl:h-12',
          'max-sm:h-[30px] max-sm:rounded-lg max-sm:border-gray-30 max-sm:shadow-none',
          'data-[active=true]:border-gray-30 hover:border-gray-30 data-[active=true]:shadow-md hover:shadow-md',
          'max-sm:data-[active=true]:shadow-none',
          'transition-all duration-200 ease-in',
        ),
        select_none: cn(
          'text-[11px] color-default rounded-[8px] text-center whitespace-nowrap overflow-hidden',
          'flex flex-col items-center justify-center w-full h-[80px] gap-1 px-1',
          'max-xl:h-16 max-xl:text-[9px]',
          'bg-gray-100 border-[2px] border-gray-200',
          'data-[active=true]:border-active hover:border-active',
          'transition-all duration-200 ease-in',
        ),
        destructive: cn(
          'text-[14px] leading-[16px] font-semibold text-default gap-2 items-center',
          'max-xl:text-[11px] max-xl:leading-[13px] max-xl:gap-1.5',
          'max-sm:text-[12px] max-sm:leading-4 max-sm:gap-1 max-sm:text-[#0A0A0A]',
          'hover:text-active',
          '[&_span]:underline underline-offset-4',
          '[&_svg]:size-4 [&_svg]:shrink-0 max-xl:[&_svg]:size-3.25 max-sm:[&_svg]:size-3.5',
          'transition-all duration-200 ease-in',
        ),
        link: '',
        toggle: cn(
          'relative w-10 h-5 rounded-full transition-colors cursor-pointer shrink-0 bg-gray-300',
          'max-xl:w-8 max-xl:h-4',
          'data-[active=true]:bg-black',
          'transition-all duration-200 ease-in',
        ),
        delete: cn(
          'text-[12px] leading-[15px] font-semibold text-white gap-2 items-center bg-error',
          'max-xl:text-[10px] max-xl:leading-[12px]',
          'hover:bg-error/80',
          '[&_svg]:size-4 [&_svg]:shrink-0 max-xl:[&_svg]:size-3.25',
          'transition-all duration-200 ease-in',
        ),
        upload: cn(
          'flex-col w-full p-2 rounded-[8px] border-dashed border-gray-30 gap-2 items-center bg-white',
          'max-xl:p-1.5 max-xl:gap-1.5',
          '[&_svg]:w-[15px] [&_svg]:h-[16px] [&_svg]:shrink-0 max-xl:[&_svg]:w-3 max-xl:[&_svg]:h-3.25',
          'hover:bg-gray-100 hover:shadow-sm',
          'transition-all duration-200 ease-in',
        ),
        checkout: cn(
          'justify-center items-center text-[20px] rounded-[8px] text-white font-[600] bg-[#0A0A0A]',
          'hover:bg-gray-100 hover:shadow-sm hover:text-[#0A0A0A]',
          'transition-all duration-200 ease-in',
        ),
      },
      size: {
        default: '',
        xs: 'py-1.5 px-2.5 text-[14px] leading-[15px] rounded-[8px] gap-2 h-[31px]',
        sm: cn('py-3 px-4 text-4 leading-4 rounded-[8px] gap-2 h-10', 'max-xl:py-2.5 max-xl:px-3 max-xl:h-8'),
        lg: '',
        icon: 'p-1 rounded-sm',
        'icon-xs': '',
        'icon-sm': '',
        'icon-lg': '',
        delete: cn('px-2 h-[28.5px] rounded-[8px]', 'max-xl:h-[23px]'),
        checkout: 'h-[55px] w-full p-5',
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
