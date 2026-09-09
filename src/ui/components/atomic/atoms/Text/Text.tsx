'use client';

import { Slot } from '@radix-ui/react-slot';

import { cva } from 'class-variance-authority';

import { cn } from '@utils';
import type { textPropsType } from '@types';

const variantText = cva('font-inter font-[400] leading-none', {
  variants: {
    variant: {
      default: cn('text-[16px] text-default', 'max-xl:text-[13px]'),
      whatsapp_badge: 'text-[14px] leading-[24px] text-white font-medium',
      product_name: cn('text-[32px] leading-[1] font-[600] tracking-[-1px]', 'max-xl:text-[20px]', 'max-sm:text-[20px]'),
      product_name_no_margin: cn('mb-0 text-[32px] leading-[1] font-[600] tracking-[-1px]', 'max-xl:text-[20px]', 'max-sm:text-[20px]'),
      product_price: cn(
        'text-[32px] leading-[39px] font-semibold tracking-[-1px]',
        'max-xl:text-[24px] max-xl:leading-[31px]',
        'max-sm:text-[26px] max-sm:leading-[100%]',
      ),
      product_price_mobile_only: cn(
        'hidden text-[32px] leading-[39px] font-semibold tracking-[-1px]',
        'max-xl:text-[24px] max-xl:leading-[31px]',
        'max-sm:block max-sm:text-[26px] max-sm:leading-[100%]',
      ),
      menu_step_buy: cn(
        'relative text-[22px] text-gray-10 leading-[27px] font-semibold uppercase overflow-hidden cursor-pointer',
        'max-xl:text-[18px] max-xl:leading-[22px]',
        'max-sm:text-[12px] max-sm:leading-[12px]',
        'data-[active=true]:text-default hover:text-default',
        'transition-colors duration-300 ease-in-out',
      ),
      slider_label: cn(
        'text-[14px] leading-[15px] text-gray whitespace-nowrap',
        'max-xl:text-[11px] max-xl:leading-[12px]',
        'data-[thumb=true]:text-default data-[thumb=true]:absolute data-[thumb=true]:top-0 data-[thumb=true]:-translate-x-1/2',
      ),
      configurator_part_label: cn(
        'text-[16px] leading-[16px] font-semibold text-gray-30 underline-gray-30',
        'max-xl:text-[13px] max-xl:leading-[13px]',
        'max-sm:text-[14px] max-sm:leading-4',
        'group-aria-expanded/accordion-trigger:text-default',
        'transition-all duration-200 ease-in-out',
      ),
      configurator_control_label: cn(
        'text-[14px] leading-[15px] font-[400] text-gray',
        'max-xl:text-[11px] max-xl:leading-[12px]',
        'max-sm:text-[12px] max-sm:leading-[15px]',
      ),
      configurator_control_label_shrink: cn(
        'shrink-0 text-[14px] leading-[15px] font-[400] text-gray',
        'max-xl:text-[11px] max-xl:leading-[12px]',
        'max-sm:text-[12px] max-sm:leading-[15px]',
      ),
      configurator_brand_logo_description: 'text-[12px] max-xl:text-[10px] font-normal leading-[1.2] text-gray',
      configurator_brand_logo_title: 'text-[16px] max-xl:text-[13px] font-semibold tracking-wide text-black-10',
      configurator_brand_logo_title_clamped: 'line-clamp-1 text-[16px] max-xl:text-[13px] font-semibold tracking-wide text-black-10',
      configurator_product_description: 'text-[14px] font-medium text-gray-40 max-xl:text-[11px] max-xl:leading-4 max-sm:text-[12px] max-sm:leading-4',
      configurator_product_badge_title: 'font-semibold max-xl:text-[13px] max-sm:text-[12px] max-sm:leading-4',
      configurator_product_minimum: 'text-[14px] text-gray max-xl:text-[11px] max-sm:text-[12px] max-sm:leading-3.75 max-sm:text-[#6B7280]',
      configurator_product_volume_discount: 'text-[#6B7280] font-medium max-xl:text-[11px] max-sm:text-[12px] max-sm:leading-3.75 max-sm:font-normal',
      loader_tagline: 'text-center text-[20px] font-medium italic text-[#2B2B2B]',
      logo_uploaded_label: 'text-[14px] leading-[15px] max-xl:text-[11px] max-xl:leading-3 text-gray',
      logo_uploaded_label_dark: 'text-[14px] leading-[15px] max-xl:text-[11px] max-xl:leading-3 text-gray-10',
      logo_uploaded_hint: 'text-[12px] max-xl:text-[10px] text-gray',
      logo_uploaded_file_name:
        'text-[16px] leading-[20px] max-xl:text-[13px] max-xl:leading-4 font-semibold text-black-10 tracking-wide line-clamp-2 text-left',
      logo_upload_cta_primary: 'text-center text-wrap text-[11px] leading-[15px] font-medium max-xl:text-[9px] max-xl:leading-3',
      logo_upload_cta_secondary: 'text-center text-wrap text-[10px] leading-[15px] text-gray-10 max-xl:text-[8px] max-xl:leading-3',
      error_xs: 'text-xs text-error',
      checkout_empty_cart_title: 'text-[20px] font-medium text-default',
      checkout_mobile_note: 'text-[12px] leading-3.75 text-[#71717A]',
      checkout_quantity_value: 'min-w-6 text-center text-[16px] leading-[19px] max-sm:min-w-4 max-sm:text-[14px]',
      checkout_modal_field_label: 'text-[14px] font-medium text-gray',
      checkout_small_secondary_mobile: 'text-[16px] leading-[15px] text-gray max-sm:text-[14px]',
      checkout_small_secondary_mobile_default: 'text-[16px] leading-[15px] text-default max-sm:text-[14px]',
      checkout_summary_discount_title: 'text-[14px] font-bold leading-4 text-white',
      checkout_summary_discount_subtitle: 'text-center text-[12px] font-medium leading-3.5 text-white',
      checkout_summary_item_name_default: 'font-semibold text-[20px] leading-4 text-[#0A0A0A]',
      checkout_summary_item_name_compact: 'font-semibold text-[16px] leading-4 text-[#0A0A0A]',
      checkout_summary_price_default: 'shrink-0 font-semibold text-[24px] leading-4 tracking-[-1px] text-[#0A0A0A]',
      checkout_summary_price_compact: 'shrink-0 font-semibold text-[18px] leading-none tracking-[-1px] text-[#0A0A0A]',
      checkout_summary_shipping_label_default: 'font-medium text-[16px] leading-4 text-[#0A0A0A]',
      checkout_summary_shipping_label_compact: 'font-medium text-[14px] leading-4 text-[#0A0A0A]',
      checkout_summary_total_label_default: 'font-semibold text-[20px] leading-4 text-[#0A0A0A]',
      checkout_summary_total_label_compact: 'font-semibold text-[16px] leading-4 text-[#0A0A0A]',
      checkout_summary_vat_note: 'text-[12px] font-medium leading-3.5 text-[#71717A]',
      checkout_summary_timeline_title: 'text-[14px] font-medium leading-4 text-[#0A0A0A]',
      checkout_summary_timeline_step_label: 'text-center text-[12px] leading-3 text-black',
      checkout_summary_timeline_step_date: 'text-center text-[11px] leading-3.5 text-[#71717A]',
      checkout_summary_trust_label: 'text-[14px] font-medium leading-4',
      checkout_summary_mobile_total_label: 'text-[12px] font-medium leading-3 text-[#71717A]',
      checkout_summary_mobile_vat_label: 'text-[11px] font-medium leading-3 text-[#71717A]',
      checkout_summary_mobile_total_amount: 'text-[22px] font-semibold leading-none tracking-[-1px] text-[#0A0A0A]',
      checkout_summary_drawer_title: 'mb-4 text-[24px] font-semibold leading-none tracking-[-1px] text-[#0A0A0A]',
      aside_help_title: 'text-[16px] text-base-black font-medium max-xl:hidden',
      catalog_popover_title: 'text-[16px] font-semibold uppercase text-default',
      product_session_name: 'truncate whitespace-nowrap text-[14px] font-medium max-sm:text-[12px] max-sm:leading-4 max-sm:font-semibold',
      rich_text: 'leading-[1.4] text-left w-full',
      h2: cn('text-[40px] leading-[1] font-[700] text-base-black mb-8 uppercase tracking-[-1px]', 'max-sm:text-[28px] max-sm:mb-4'),
      h3: cn('text-[24px] leading-[1] font-semibold text-base-black mb-3', 'max-sm:text-[18px] max-sm:mb-2'),
      h3_italic_uppercase: cn('mb-3 text-[24px] leading-[1] font-semibold text-base-black italic uppercase', 'max-sm:text-[18px] max-sm:mb-2'),
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
