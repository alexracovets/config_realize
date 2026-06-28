type textVariantType =
  | 'default'
  | 'whatsapp_badge'
  | 'product_name'
  | 'product_price'
  | 'menu_step_buy'
  | 'slider_label'
  | 'configurator_part_label'
  | 'configurator_control_label'
  | 'h2'
  | 'h3'
  | 'small'
  | 'small_secondary'
  | 'product_card_name';

type boxVariantType = 'default' | 'header' | 'footer' | 'toggle_handle';

type flexVariantType =
  | 'default'
  | 'utility_bar'
  | 'search_bar'
  | 'user_bar'
  | 'step_design'
  | 'aside_configurator_content'
  | 'configurator_part'
  | 'slider_labels'
  | 'info_part'
  | 'product_card_name';

type gridVariantType = 'default' | 'header' | 'configurator' | 'configurator_price' | 'select_parts' | 'aside_configurator';

type atomImageVariantType = 'default' | 'logo' | 'logo_full';

type atomTabsVariantType = 'default' | 'line' | 'configurator' | 'modal';

type atomTabsSlidingListPresetType = 'configurator' | 'modal';

type atomTableVariantType = 'default' | 'size_chart' | 'discounts' | 'checkout';

type atomListVariantType = 'default' | 'faq';

type slidingIndicatorVariantType = 'gradient' | 'solid';

type slidingIndicatorTrackVariantType = 'default' | 'none';

export type {
  atomImageVariantType,
  atomListVariantType,
  atomTableVariantType,
  atomTabsSlidingListPresetType,
  atomTabsVariantType,
  boxVariantType,
  flexVariantType,
  gridVariantType,
  slidingIndicatorTrackVariantType,
  slidingIndicatorVariantType,
  textVariantType,
};
