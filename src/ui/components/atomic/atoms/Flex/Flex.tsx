'use client';

import { Slot } from '@radix-ui/react-slot';
import { forwardRef } from 'react';

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
      step_design: cn('flex-col gap-7 w-full', 'max-xl:gap-5.5', 'max-sm:gap-2'),
      aside_configurator_content: 'flex-col gap-7 w-full py-6 min-h-0',
      configurator_part: cn('flex flex-col items-start justify-start gap-3 w-full', 'max-xl:gap-2.5', 'max-sm:gap-2'),
      configurator_part_clipped: cn('flex flex-col items-start justify-start gap-3 w-full overflow-hidden', 'max-xl:gap-2.5', 'max-sm:gap-2'),
      slider_labels: 'relative w-full flex justify-between',
      info_part: 'flex flex-col items-start justify-start w-full',
      product_card_name: 'flex min-h-[36px] flex-1 flex-col items-center justify-center w-full bg-gray-20 px-1 py-1',
      header_configuration: cn('flex items-center justify-center bg-white py-2 w-full min-w-0', 'max-xl:px-4', 'max-sm:py-0 max-sm:px-4'),
      configurator_layout_template: cn(
        'grid min-h-0 grid-cols-[auto_minmax(0,1fr)_auto] overflow-hidden w-full',
        'max-xl:relative max-xl:grid-cols-[auto_minmax(0,1fr)]',
        'max-sm:relative max-sm:grid max-sm:h-full max-sm:min-h-0 max-sm:flex-1 max-sm:grid-cols-1 max-sm:grid-rows-[auto_minmax(0,1fr)] max-sm:items-start max-sm:overflow-hidden',
      ),
      configurator_view: cn(
        'relative h-full min-h-0 min-w-0 w-full',
        'max-sm:col-start-1 max-sm:row-start-1 max-sm:h-auto max-sm:shrink max-sm:flex-col max-sm:items-stretch max-sm:justify-start',
      ),
      configurator_view_canvas: cn('relative h-full min-h-0 min-w-0 w-full', 'max-sm:h-[328px] max-sm:shrink-0'),
      card_add_product: cn(
        'absolute left-0 top-4 z-30 flex max-h-[calc(100%-1rem)] w-15 flex-col gap-0 overflow-visible',
        'max-sm:absolute max-sm:left-2 max-sm:top-7 max-sm:z-30 max-sm:h-auto max-sm:max-h-[280px] max-sm:w-12 max-sm:shrink-0',
      ),
      aside_utility_column: 'h-full w-[253px] flex-col justify-start gap-6 max-xl:h-auto max-xl:w-fit max-xl:gap-2',
      aside_utility_help_panel:
        'w-full flex-col gap-3 rounded-md border-2 border-input-border p-4 max-xl:w-8 max-xl:gap-0 max-xl:border-0 max-xl:p-0 max-sm:w-9',
      between_aligned_full: 'w-full items-center justify-between',
      control_primary_column: 'flex-col items-start gap-2',
      logo_upload_section: 'w-full flex-col items-start justify-start gap-2 max-xl:gap-1.5',
      logo_edit_panel_column: 'w-full flex-col items-start justify-start gap-5 max-xl:gap-4',
      logo_uploaded_section: 'w-full flex-col items-start gap-3 max-xl:gap-2.5',
      logo_uploaded_list: 'w-full flex-col items-start gap-5 max-xl:gap-4',
      brand_placeholder_column: 'flex-col items-start gap-2 max-xl:gap-1.5',
      brand_placeholder_row: 'items-center gap-2 max-xl:gap-1.5',
      skeleton_column_full_gap3: 'w-full flex-col gap-3',
      skeleton_column_full_gap2: 'w-full flex-col gap-2',
      skeleton_row_center_gap2: 'items-center gap-2',
      skeleton_card_column: 'w-full flex-col gap-3 rounded-[8px] border border-input-border p-3',
      skeleton_inner_column: 'w-full min-w-0 flex-col gap-3 pt-1',
      skeleton_hint_row: 'min-h-[24px] w-full items-center gap-2 px-2',
      loader_column_center_gap5: 'flex-col items-center gap-5',
      logo_pair_row: 'min-w-0 max-w-full items-center justify-center gap-7',
      overlay_center_column: 'absolute inset-0 z-10 w-full flex-col items-center justify-center gap-2',
      checkout_empty_state: 'min-h-[60vh] w-full flex-col items-center justify-center gap-6 text-center',
      checkout_content_column: 'min-w-0 w-full flex-col items-start justify-start gap-6 pt-9 max-sm:gap-4 max-sm:pt-4 max-sm:pb-[160px]',
      checkout_mobile_note_column: 'hidden w-full flex-col gap-2 max-sm:flex',
      footer_desktop_row: 'w-full items-center justify-center gap-2 pb-12 pt-2 max-sm:hidden',
      footer_mobile_column: 'hidden w-full flex-col gap-4 pt-3 pb-6 max-sm:flex',
      footer_mobile_grid: 'w-full max-sm:grid max-sm:grid-cols-4 max-sm:gap-0.5',
      checkout_modal_content_column: 'w-full flex-col items-stretch gap-4',
      checkout_modal_field_group: 'w-full flex-col items-start gap-1.5',
      checkout_modal_actions_column: 'w-full flex-col gap-2',
      checkout_product_layout: 'w-full flex-wrap items-start justify-start gap-5 max-sm:gap-3',
      checkout_product_details: 'min-w-50 flex-1 flex-col items-start justify-start gap-3 max-sm:w-full max-sm:gap-2',
      checkout_product_quantity_row: 'gap-3 max-sm:w-full max-sm:justify-between',
      checkout_product_quantity_inner: 'gap-3',
      checkout_product_side_column: 'flex-col items-end gap-3 max-sm:hidden',
      checkout_product_meta_row: 'max-w-[250px] flex-wrap items-start gap-2',
      skeleton_step_inner_column: 'w-full min-w-0 flex-col gap-5 pt-1',
      skeleton_row_center_gap3: 'items-center gap-3',
      checkout_summary_between_row: 'w-full items-center justify-between gap-2',
      checkout_summary_between_wrap_row: 'w-full flex-wrap items-center justify-between gap-2',
      checkout_summary_item_inline: 'min-w-0 flex-wrap items-center gap-2',
      checkout_summary_total_label_column: 'flex-col items-start justify-start gap-1',
      checkout_summary_section_column: 'w-full flex-col items-start gap-3',
      checkout_summary_timeline_column: 'w-full flex-col gap-8 max-xl:gap-4',
      checkout_summary_timeline_row: 'w-full items-start',
      checkout_summary_timeline_step_column: 'min-w-0 flex-1 flex-col items-center gap-1.5 text-center',
      checkout_summary_timeline_icon: 'size-6.25 items-center justify-center rounded-full bg-black text-white',
      checkout_summary_body_column: 'w-full flex-col gap-8 max-xl:gap-4',
      checkout_summary_actions_column: 'w-full flex-col gap-3',
      checkout_mobile_note_left_column: 'hidden w-full flex-col items-start gap-2 text-left max-sm:flex',
      full_width: 'w-full',
      centered_inline: 'mx-auto items-center justify-center',
      card_list_column: 'flex-col gap-0',
      skeleton_logo_upload_column: 'w-full flex-col items-start gap-2',
      skeleton_configurator_root: 'w-full min-w-0 flex-col',
      skeleton_configurator_meta: 'flex-col gap-2 px-3 py-2',
      step_design_mobile_padded: cn('flex-col gap-7 w-full max-sm:py-1', 'max-xl:gap-5.5', 'max-sm:gap-2'),
      modal_add_product_preview_row: 'mx-auto items-center justify-center gap-1',
      modal_add_product_actions: 'w-full flex-col gap-3',
      share_dialog_row: 'w-full min-w-0 flex-col items-stretch gap-3 sm:flex-row sm:items-stretch sm:gap-2',
      part_color_switch_row: 'min-w-0 flex-1 items-center justify-start gap-3 text-inherit max-xl:gap-2.5 max-sm:gap-2',
      part_color_switch_inner: 'min-w-0 items-center gap-2 max-xl:gap-1.5',
      configurator_product_root: 'w-full flex-col items-start gap-3 max-xl:gap-2.5',
      configurator_product_badge:
        'flex-col items-start rounded-sm bg-primary px-3 py-2 transition-colors hover:bg-primary/90 max-xl:px-2.5 max-xl:py-1.5 max-sm:flex-row max-sm:items-center max-sm:gap-1 max-sm:px-2 max-sm:py-1',
      modal_info_tab_content: 'w-full flex-col gap-6',
      modal_info_parts_column: 'w-full flex-col items-stretch gap-4',
      modal_info_text_part: 'w-full flex-col gap-2',
      modal_info_text_part_left: 'w-full flex-col gap-2 text-left',
      logo_list_actions: 'shrink-0 gap-1',
      step_design_compact: 'w-full flex-col items-stretch justify-start gap-3 max-xl:gap-2.5 max-sm:gap-2',
      configurator_part_spaced: 'w-full flex-col items-start justify-start gap-5 pt-2 max-xl:gap-4 max-sm:gap-2',
      step_design_logo_column: 'w-full min-h-0 flex-col items-start justify-start gap-4 max-xl:gap-3',
      checkout_cell_row: 'w-full items-center',
      checkout_cell_row_start: 'w-full items-center justify-start',
      checkout_cell_row_center: 'w-full items-center justify-center',
      checkout_cell_actions_row: 'w-full items-center gap-1.5',
      checkout_cell_actions_between: 'w-full items-center justify-between gap-1.5',
      checkout_cell_actions_center: 'w-full items-center justify-center gap-1.5',
      checkout_placeholder_row: 'w-full items-center justify-center',
      product_session_preview_frame: 'relative h-11 w-11 shrink-0 max-sm:h-7 max-sm:w-7',
      product_session_preview_center: 'size-full items-center justify-center',
      range_control_clipped: 'overflow-hidden',
      color_control_panel: 'w-full flex-col gap-3 max-xl:gap-2.5 max-sm:flex-row max-sm:items-center max-sm:justify-between max-sm:gap-2',
      checkout_summary_list_compact: 'w-full flex-col items-stretch justify-start gap-3',
      checkout_summary_list_default: 'w-full flex-col items-stretch justify-start gap-5',
      checkout_summary_meta_compact: 'w-full flex-col items-stretch justify-start gap-4',
      checkout_summary_meta_default: 'w-full flex-col items-stretch justify-start gap-8',
      checkout_product_actions: 'flex-wrap items-center gap-2',
      tab_control_header: 'w-full border-b border-gray-200',
      checkout_summary_mobile_actions: 'w-full shrink-0 flex-col items-stretch justify-start gap-[11px]',
      checkout_summary_mobile_head: 'w-full items-center justify-between gap-3',
      checkout_summary_mobile_total: 'min-w-0 flex-col items-start gap-1',
      checkout_summary_mobile_total_labels: 'min-w-0 flex-wrap items-baseline justify-start gap-x-1.5 gap-y-0',
      checkout_summary_mobile_content: 'flex-col gap-4',
      checkout_summary_drawer_container: 'fixed inset-x-0 bottom-0 z-50 hidden max-sm:block',
      checkout_summary_drawer_header: 'absolute inset-x-0 top-0 flex-col items-stretch justify-start overflow-hidden',
      checkout_summary_drawer_sections: 'w-full flex-col items-stretch justify-start gap-4',
      checkout_summary_drawer_separator: 'w-full py-3',
      checkout_summary_drawer_footer: 'absolute inset-x-0 bottom-0 box-border flex-col items-stretch justify-end px-4 pb-6 pt-1',
      checkout_summary_drawer_handle: 'shrink-0 touch-none items-center justify-center',
      last_order_page_column: 'mx-auto max-w-[720px] flex-col gap-6 py-10',
      last_order_meta_column: 'flex-col gap-1 text-sm text-gray-30',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

const Flex = forwardRef<HTMLDivElement, flexPropsType>(({ variant = 'default', asChild = false, className, children, style, ...props }, ref) => {
  const Component = asChild ? Slot : 'div';

  return (
    <Component ref={ref} className={cn(variantFlex({ variant, className }))} {...props} style={style}>
      {children}
    </Component>
  );
});

Flex.displayName = 'Flex';

export { Flex };
