'use client';

import { Slot } from '@radix-ui/react-slot';

import { cva } from 'class-variance-authority';

import { cn } from '@utils';
import type { flexPropsType } from '@types';

const variantFlex = cva('flex w-fit items-center justify-center', {
  variants: {
    variant: {
      default: '',
      utility_bar: cn('gap-5', 'max-sm:gap-2'),
      search_bar: cn(
        'relative rounded-full w-full h-full justify-start overflow-hidden border border-transparent bg-white outline-none',
        'data-[active=true]:border-border',
      ),
      user_bar: 'justify-end gap-3 w-full',
      step_design: cn('flex-col gap-7 w-full', 'max-sm:gap-2'),
      aside_configurator_content: 'flex-col gap-7 w-full py-6 min-h-0',
      configurator_part: cn('flex flex-col items-start justify-start gap-3 w-full', 'max-sm:gap-2'),
      slider_labels: 'relative w-full flex justify-between',
      info_part: 'flex flex-col items-start justify-start w-full',
      product_card_name: 'flex min-h-[36px] flex-1 flex-col items-center justify-center w-full bg-gray-20 px-1 py-1',
      header_configuration: cn('flex items-center justify-center bg-white py-2 w-full min-w-0', 'max-sm:py-0 max-sm:px-4'),
      configurator_layout_template: cn(
        'grid min-h-0 grid-cols-[auto_minmax(0,1fr)_auto] overflow-hidden w-full',
        'max-sm:grid max-sm:h-full max-sm:min-h-0 max-sm:flex-1 max-sm:grid-cols-[auto_1fr_auto] max-sm:grid-rows-[auto_minmax(0,1fr)] max-sm:items-start max-sm:overflow-hidden',
      ),
      configurator_view: cn(
        'relative h-full min-h-0 min-w-0 w-full',
        'max-sm:col-start-2 max-sm:row-start-1 max-sm:h-auto max-sm:shrink max-sm:flex-col max-sm:items-stretch max-sm:justify-start',
      ),
      configurator_view_canvas: cn('relative h-full min-h-0 min-w-0 w-full', 'max-sm:h-[328px] max-sm:shrink-0'),
      card_add_product: cn(
        'absolute left-0 top-4 z-30 flex max-h-[calc(100%-1rem)] w-15 flex-col gap-0 overflow-visible',
        'max-sm:relative max-sm:col-start-1 max-sm:row-start-1 max-sm:top-0 max-sm:h-auto max-sm:max-h-[328px] max-sm:w-12 max-sm:shrink-0 max-sm:self-start max-sm:pt-7',
      ),
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

const Flex = ({ variant = 'default', asChild = false, className, children, style, ...props }: flexPropsType) => {
  const Component = asChild ? Slot : 'div';

  return (
    <Component className={cn(variantFlex({ variant, className }))} {...props} style={style}>
      {children}
    </Component>
  );
};

export { Flex };
