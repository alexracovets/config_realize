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
      product_name: 'text-[32px] leading-[1] font-[600] tracking-[-1px]',
      product_price: 'text-[32px] leading-[39px] font-semibold tracking-[-1px]',
      menu_step_buy: cn(
        'relative text-[22px] text-gray-10 leading-[27px] font-semibold uppercase overflow-hidden cursor-pointer',
        'data-[active=true]:text-default hover:text-default',
        'transition-colors duration-300 ease-in-out',
      ),
      slider_label: cn('text-[14px] leading-[15px] text-gray', 'data-[thumb=true]:text-default data-[thumb=true]:absolute data-[thumb=true]:-translate-x-1/2'),
      configurator_part_label: cn(
        'text-[16px] leading-[16px] font-semibold text-gray-30 underline-gray-30',
        'group-aria-expanded/accordion-trigger:text-default',
        'transition-all duration-200 ease-in-out',
      ),
      configurator_control_label: 'text-[14px] leading-[15px] font-[400] text-gray',
      h2: 'text-[40px] leading-[1] font-[700] text-base-black mb-8 uppercase tracking-[-1px]',
      h3: 'text-[24px] leading-[1] font-semibold text-base-black mb-3',
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

const Text = ({ className, variant, asChild = false, children, ...props }: textPropsType) => {
  const Comp = asChild ? Slot : 'p';

  return (
    <Comp data-slot="text" className={cn(variantText({ variant, className }))} {...props}>
      {children}
    </Comp>
  );
};

export { Text };
