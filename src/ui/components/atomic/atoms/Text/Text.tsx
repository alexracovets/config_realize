'use client';

import { Slot } from '@radix-ui/react-slot';

import { cva } from 'class-variance-authority';

import { cn } from '@utils';
import type { textPropsType } from '@types';

const variantText = cva('font-inter font-[400] leading-none', {
  variants: {
    variant: {
      default: 'text-[16px] text-default',
      whatsapp_badge: 'text-[14px] leading-[24px] text-white font-medium',
      product_name: cn('text-[32px] leading-[1] font-[600] tracking-[-1px]', 'max-sm:text-[20px]'),
      product_price: cn('text-[32px] leading-[39px] font-semibold tracking-[-1px]', 'max-sm:text-[26px] max-sm:leading-[100%]'),
      menu_step_buy: cn(
        'relative text-[22px] text-gray-10 leading-[27px] font-semibold uppercase overflow-hidden cursor-pointer',
        'max-sm:text-[12px] max-sm:leading-[12px]',
        'data-[active=true]:text-default hover:text-default',
        'transition-colors duration-300 ease-in-out',
      ),
      slider_label: cn(
        'text-[14px] leading-[15px] text-gray whitespace-nowrap',
        'data-[thumb=true]:text-default data-[thumb=true]:absolute data-[thumb=true]:top-0 data-[thumb=true]:-translate-x-1/2',
      ),
      configurator_part_label: cn(
        'text-[16px] leading-[16px] font-semibold text-gray-30 underline-gray-30',
        'max-sm:text-[14px] max-sm:leading-4',
        'group-aria-expanded/accordion-trigger:text-default',
        'transition-all duration-200 ease-in-out',
      ),
      configurator_control_label: cn('text-[14px] leading-[15px] font-[400] text-gray', 'max-sm:text-[12px] max-sm:leading-[15px]'),
      h2: cn('text-[40px] leading-[1] font-[700] text-base-black mb-8 uppercase tracking-[-1px]', 'max-sm:text-[28px] max-sm:mb-4'),
      h3: cn('text-[24px] leading-[1] font-semibold text-base-black mb-3', 'max-sm:text-[18px] max-sm:mb-2'),
      small: 'text-[14px] text-gray',
      small_secondary: 'text-[16px] leading-[15px] text-gray',
      product_card_name: cn(
        'text-[14px] leading-[16px] font-[800] line-clamp-2 w-full wrap-break-word text-center whitespace-normal px-[0.5]',
        'transition-colors duration-200 ease-in-out group-hover/button:text-active',
      ),
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

const Text = ({ className, variant, asChild = false, children, ref, ...props }: textPropsType) => {
  const Comp = asChild ? Slot : 'p';

  return (
    <Comp ref={ref as never} data-slot="text" className={cn(variantText({ variant, className }))} {...props}>
      {children}
    </Comp>
  );
};

export { Text };
