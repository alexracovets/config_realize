'use client';

import { AtomTooltip, Button, Flex, Grid, SvgIcon, Text } from '@atoms';

import {
  buildMinimumQuantityLabel,
  CHECKOUT_ADD_MORE_PRODUCTS_LABEL,
  CHECKOUT_COMPLETE_CONFIG_LABEL,
  CHECKOUT_DISCOUNT_INFO_LABEL,
  CHECKOUT_EMPTY_CART_LABEL,
  CHECKOUT_SHIPPING_DAYS_LABEL,
} from '@constants';
import { useAppNavigate, useCheckoutSummary, useNavigateToConfigurator, useSubmitCheckout } from '@hooks';
import { CheckoutOrderExport, CheckoutProductCard, CheckoutSummaryPanel, OrderCuttingExport } from '@molecules';
import { useCheckout, useConfigurationCart } from '@store';

const CheckoutView = () => {
  const { navigateToConfigurator } = useNavigateToConfigurator();
  const { navigateToAppPath } = useAppNavigate();
  const { submitCheckout, isSubmitting } = useSubmitCheckout();
  const { canProceed, minimumQuantity } = useCheckoutSummary();
  const products = useCheckout((state) => state.products);
  const activeItem = useConfigurationCart((state) => state.items.find((item) => item.id === state.activeItemId) ?? state.items[0]);

  if (products.length === 0) {
    return (
      <Flex variant="checkout_empty_state">
        <Text variant="checkout_empty_cart_title">{CHECKOUT_EMPTY_CART_LABEL}</Text>
        <Button size="sm" className="border border-gray-20 bg-white" onClick={() => navigateToAppPath('/')}>
          <SvgIcon name="plus" />
          {CHECKOUT_ADD_MORE_PRODUCTS_LABEL}
        </Button>
      </Flex>
    );
  }

  return (
    <Grid variant="checkout_view_layout">
      <Flex variant="checkout_content_column">
        {products.map((product) => (
          <CheckoutProductCard key={product.cartItemId} product={product} />
        ))}
        <Flex variant="checkout_mobile_note_left_column">
          <Text variant="checkout_mobile_note">{CHECKOUT_DISCOUNT_INFO_LABEL}</Text>
          <Text variant="checkout_mobile_note">{CHECKOUT_SHIPPING_DAYS_LABEL}</Text>
        </Flex>
        <CheckoutOrderExport />
        <OrderCuttingExport />
        <Button
          size="sm"
          className="self-start border border-gray-20 bg-white max-sm:hidden"
          onClick={() => activeItem && navigateToConfigurator(activeItem.collectionHandle, activeItem.slug)}
          disabled={!activeItem?.collectionHandle}
        >
          <SvgIcon name="plus" />
          {CHECKOUT_ADD_MORE_PRODUCTS_LABEL}
        </Button>

        <Flex variant="checkout_mobile_note_column">
          <Button
            size="sm"
            className="h-9 w-full justify-center gap-2 rounded-lg border-0 bg-[#D4D4D8]/80 text-[14px] leading-4 font-semibold text-black"
            onClick={() => activeItem && navigateToConfigurator(activeItem.collectionHandle, activeItem.slug)}
            disabled={!activeItem?.collectionHandle}
          >
            <SvgIcon name="plus" className="size-3.5" />
            {CHECKOUT_ADD_MORE_PRODUCTS_LABEL}
          </Button>
          <AtomTooltip content={!canProceed ? buildMinimumQuantityLabel(minimumQuantity) : undefined} className="w-full cursor-not-allowed">
            <Button
              size="sm"
              className="h-9 w-full justify-center gap-2 rounded-lg border-0 bg-linear-to-r from-black via-[#DC2C6F] to-[#E9CC76] text-[14px] leading-4 font-semibold text-white"
              disabled={isSubmitting || !canProceed}
              onClick={submitCheckout}
            >
              <SvgIcon name="cart" className="size-3.5" />
              {isSubmitting ? 'Attendere…' : CHECKOUT_COMPLETE_CONFIG_LABEL}
            </Button>
          </AtomTooltip>
        </Flex>
      </Flex>

      <CheckoutSummaryPanel />
    </Grid>
  );
};

export { CheckoutView };
