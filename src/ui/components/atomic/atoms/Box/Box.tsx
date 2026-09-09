'use client';

import { Slot } from '@radix-ui/react-slot';
import { forwardRef } from 'react';

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
        'max-xl:w-3 max-xl:h-3',
        'data-[active=true]:translate-x-5 max-xl:data-[active=true]:translate-x-4.5',
        'transition-all duration-200 ease-in',
      ),
      aside_configuration: cn(
        'relative h-full min-h-0 overflow-visible p-4 pl-16',
        'max-xl:p-3 max-xl:pl-16',
        'max-sm:col-start-1 max-sm:col-span-3 max-sm:row-start-2 max-sm:flex max-sm:min-h-0 max-sm:w-full max-sm:flex-col max-sm:p-4 max-sm:pl-4 max-sm:pb-0',
      ),
      aside_utility: cn(
        'h-full p-4 pr-12',
        'max-xl:absolute max-xl:right-2 max-xl:top-7 max-xl:z-30 max-xl:h-auto max-xl:w-fit max-xl:px-1 max-xl:pb-2 max-xl:pt-0',
        'max-sm:right-2 max-sm:top-7',
      ),
      responsive_hidden_mobile: 'contents max-sm:hidden',
      responsive_mobile_only: 'hidden max-sm:contents',
      content_panel: 'flex min-h-0 min-w-0 flex-1 flex-col max-sm:py-0',
      info_image_wrapper: 'mx-auto w-full max-w-[400px]',
      palette_carousel_mobile: 'hidden w-full min-w-0 max-sm:block',
      hidden_mobile: 'max-sm:hidden',
      relative_fill: 'relative h-full w-full',
      skeleton_card_surface: 'w-full rounded-[8px] border border-input-border bg-white px-3 py-3',
      checkout_quantity_badge: 'rounded-lg border border-primary-10 px-4 py-1.5 max-sm:border-[#4B5563] max-sm:px-3 max-sm:py-1',
      notification_dot: 'absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#FF0000]',
      shrink_0: 'shrink-0',
      video_preview_root: 'relative h-full w-full overflow-hidden',
      brand_logo_placeholder_shell: 'w-full rounded-[8px] border border-input-border px-3 py-2 max-xl:px-2.5 max-xl:py-1.5',
      catalog_option_media_frame: 'relative aspect-square w-full shrink-0 overflow-hidden',
      flex_1: 'flex-1',
      loader_content_layer: 'relative z-10',
      checkout_table_root: 'w-full min-w-0',
      checkout_table_shell: 'w-full overflow-hidden max-sm:rounded-t-lg max-sm:border-x max-sm:border-t max-sm:border-[#D4D4D4]',
      modal_info_table_shell: 'w-full min-w-0 self-stretch overflow-x-auto',
      canvas_loader_background: 'pointer-events-none absolute inset-0 bg-linear-to-t from-[#E8E8E8] to-white',
      modal_tabs_padding: 'pr-8 sm:pr-0',
      order_cutting_preview_shell: 'bg-[#ececec] py-10',
      order_cutting_preview_card: 'mx-auto w-fit max-w-full shadow-lg',
      desktop_only_block: 'max-sm:hidden',
      mobile_only_block: 'hidden max-sm:block',
      configurator_shell: 'configurator-shell flex w-full flex-col overflow-hidden',
      configurator_shell_background: 'relative flex min-h-0 flex-1 flex-col overflow-hidden bg-linear-to-t from-[#E8E8E8] to-white',
      configurator_shell_grid: 'relative grid min-h-0 flex-1 grid-cols-1 grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden',
      configurator_view_placeholder: 'relative h-full min-h-0 min-w-0 w-full',
      tabs_list_wrapper: 'relative w-full min-w-0 pt-2',
      checkout_product_details_panel: 'pt-6 max-sm:pt-4',
      checkout_product_details_open: 'pt-6 max-sm:block max-sm:pt-4',
      checkout_product_details_closed: 'pt-6 max-sm:hidden max-sm:pt-4',
      checkout_row_field_shell: 'flex h-[35px] w-full items-center overflow-hidden rounded-[7.5px] border border-input-border bg-white',
      checkout_row_field_shell_center: 'flex h-[35px] w-full items-center justify-center overflow-hidden rounded-[7.5px] border border-input-border bg-white',
      cutting_export_download_preview_frame: 'cutting-export__download-preview-frame',
      product_flip_card_inner:
        'relative size-full transform-3d transition-transform duration-600 ease-in-out group-focus-within/card:transform-[rotateY(180deg)] group-hover/card:transform-[rotateY(180deg)]',
      product_flip_card_front: 'absolute inset-0 backface-hidden',
      product_flip_card_back: 'absolute inset-0 transform-[rotateY(180deg)] backface-hidden',
      video_player_frame:
        'relative z-0 aspect-video w-full overflow-hidden bg-black [&_.react-player__preview]:relative [&_.react-player__preview]:z-0 [&_.react-player__preview]:h-full',
      video_player_overlay: 'absolute inset-0 z-10 cursor-pointer',
      main_loader_background_root: 'pointer-events-none absolute inset-0 overflow-hidden bg-[#ececec]',
      main_loader_background_glow: 'absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_36%,#fafafa_0%,transparent_68%)]',
      main_loader_background_top_fade:
        'absolute inset-x-0 top-0 h-[38%] bg-[linear-gradient(to_bottom,#ffffff_0%,#ffffff_12%,rgba(255,255,255,0.92)_22%,transparent_100%)]',
      main_loader_host: 'absolute inset-[-12%]',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

const Box = forwardRef<HTMLDivElement, boxPropsType>(({ variant = 'default', asChild = false, className, children, style, ...props }, ref) => {
  const Component = asChild ? Slot : 'div';

  return (
    <Component ref={ref} className={cn(variantBox({ variant, className }))} {...props} style={style}>
      {children}
    </Component>
  );
});

Box.displayName = 'Box';

export { Box };
