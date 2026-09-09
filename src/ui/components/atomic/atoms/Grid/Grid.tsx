'use client';

import { Slot } from '@radix-ui/react-slot';
import { forwardRef } from 'react';

import { cva } from 'class-variance-authority';

import { cn } from '@utils';
import type { gridPropsType } from '@types';

const variantGrid = cva('grid', {
  variants: {
    variant: {
      default: '',
      header: 'grid-cols-[1fr_auto_1fr] items-center max-sm:grid-cols-[auto_1fr_auto]',
      configurator: 'grid-cols-[334px_1fr_253px] h-full min-h-0',
      configurator_price: 'grid-cols-[auto_1fr] items-center gap-3 w-full',
      select_parts: cn(
        'grid-cols-[repeat(auto-fill,minmax(55px,1fr))] gap-2 w-full px-1',
        'max-xl:grid-cols-[repeat(auto-fill,minmax(44px,1fr))] max-xl:gap-1.5',
        'max-sm:grid-cols-[repeat(auto-fill,minmax(30px,1fr))] max-sm:px-0',
      ),
      aside_configurator: cn(
        'grid-rows-[auto_1fr] w-full max-w-[354px] h-[100vh] rounded-[10px]',
        'p-[10px] translate-y-[-10px] translate-x-[-10px] max-h-[calc(100vh-180px)]',
      ),
      aside_utility_actions: 'grid-cols-2 gap-2 max-xl:grid-cols-1',
      aside_configuration_layout:
        'h-full min-h-0 w-83.5 grid-rows-[auto_minmax(0,1fr)] gap-6 max-xl:w-58.5 max-xl:gap-5 max-sm:w-full max-sm:grid-rows-[minmax(0,1fr)] max-sm:gap-0',
      logo_info_panel: 'w-full grid-cols-[auto_1fr] items-center gap-2.5 rounded-[4px] bg-primary p-2 px-3 max-xl:gap-2 max-xl:px-2.5 max-xl:py-1.5',
      logo_list_row: 'w-full grid-cols-[1fr_auto] items-center gap-5 px-2 min-h-[24px] max-xl:gap-4 max-xl:min-h-5 max-xl:px-1.5',
      logo_list_identity: 'min-w-0 grid-cols-[auto_1fr] items-center gap-2 max-xl:gap-1.5',
      logo_edit_header: 'w-full grid-cols-[1fr_auto] items-center gap-2 max-xl:gap-1.5',
      color_control_actions: 'w-full grid-cols-[auto_auto] items-center justify-between gap-2 max-xl:gap-1.5 max-sm:w-auto max-sm:grid-cols-1',
      select_parts_mobile_hidden: cn(
        'grid-cols-[repeat(auto-fill,minmax(55px,1fr))] gap-2 w-full px-1',
        'max-xl:grid-cols-[repeat(auto-fill,minmax(44px,1fr))] max-xl:gap-1.5',
        'max-sm:hidden',
      ),
      checkout_view_layout:
        'min-h-0 flex-1 grid-cols-[minmax(0,1fr)_400px] items-start gap-8 max-xl:grid-cols-[minmax(0,1fr)_250px] max-xl:gap-4 max-sm:grid-cols-1 max-sm:gap-4',
      footer_notification: 'grid-cols-[1fr_auto] items-center',
      configurator_product_header: 'grid-cols-[1fr_auto] gap-3 max-xl:gap-2.5 max-sm:items-center',
      gallery_four_cols: 'grid-cols-4 gap-6',
      catalog_dialog_grid: 'max-h-[calc(var(--viewport-height)-var(--embed-header-offset)-140px)] grid-cols-3 gap-2 overflow-y-auto overscroll-contain pr-1',
      select_parts_minw0: 'min-w-0',
      skeleton_logo_info_panel: 'w-full grid-cols-[auto_1fr] items-center gap-2.5 rounded-[4px] p-2',
      skeleton_configurator_header: 'w-full grid-cols-[1fr_auto] gap-3',
      configurator_price_spaced: 'w-full grid-cols-[auto_1fr] items-center gap-3 mt-3',
      position_picker_grid:
        'grid max-h-[calc(var(--viewport-height)-var(--embed-header-offset)-160px)] grid-cols-3 gap-3 overflow-y-auto overscroll-contain pr-1 max-sm:gap-2 sm:gap-4',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

const Grid = forwardRef<HTMLDivElement, gridPropsType>(({ variant = 'default', asChild = false, className, children, style, ...props }, ref) => {
  const Component = asChild ? Slot : 'div';

  return (
    <Component ref={ref} className={cn(variantGrid({ variant, className }))} {...props} style={style}>
      {children}
    </Component>
  );
});

Grid.displayName = 'Grid';

export { Grid };
