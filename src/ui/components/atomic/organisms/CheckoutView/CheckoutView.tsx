'use client';

import { Button, Flex, Grid, SvgIcon, Text } from '@atoms';

import {
  CHECKOUT_ADD_MORE_PRODUCTS_LABEL,
  CHECKOUT_COMPLETE_CONFIG_LABEL,
  CHECKOUT_DISCOUNT_INFO_LABEL,
  CHECKOUT_EMPTY_CART_LABEL,
  CHECKOUT_SHIPPING_DAYS_LABEL,
} from '@constants';
import { useAppNavigate, useNavigateToConfigurator, useSubmitCheckout } from '@hooks';
import { CheckoutOrderExport, CheckoutProductCard, CheckoutSummaryPanel, OrderCuttingExport } from '@molecules';
import { useCheckout, useConfigurationCart } from '@store';

const CheckoutView = () => {
  const { navigateToConfigurator } = useNavigateToConfigurator();
  const { navigateToAppPath } = useAppNavigate();
  const { submitCheckout, isSubmitting } = useSubmitCheckout();
  const products = useCheckout((state) => state.products);
  const activeItem = useConfigurationCart((state) => state.items.find((item) => item.id === state.activeItemId) ?? state.items[0]);

  if (products.length === 0) {
    return (
      <Flex className="min-h-[60vh] w-full flex-col items-center justify-center gap-6 text-center">
        <Text className="text-[20px] font-medium text-default">{CHECKOUT_EMPTY_CART_LABEL}</Text>
        <Button size="sm" className="border border-gray-20 bg-white" onClick={() => navigateToAppPath('/')}>
          <SvgIcon name="plus" />
          {CHECKOUT_ADD_MORE_PRODUCTS_LABEL}
        </Button>
      </Flex>
    );
  }

  return (
    <Grid className="min-h-0 flex-1 grid-cols-[minmax(0,1fr)_400px] items-start gap-8 max-sm:grid-cols-1 max-sm:gap-4">
      <Flex className="min-w-0 w-full flex-col items-start justify-start gap-6 pt-9 max-sm:gap-4 max-sm:pt-4 max-sm:pb-[160px]">
        {products.map((product) => (
          <CheckoutProductCard key={product.cartItemId} product={product} />
        ))}
        <Flex className="hidden max-sm:flex flex-col gap-2 w-full items-start text-left">
          <Text className="text-[12px] leading-3.75 text-[#71717A]">{CHECKOUT_DISCOUNT_INFO_LABEL}</Text>
          <Text className="text-[12px] leading-3.75 text-[#71717A]">{CHECKOUT_SHIPPING_DAYS_LABEL}</Text>
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

        <Flex className="hidden max-sm:flex flex-col gap-2 w-full">
          <Button
            size="sm"
            className="h-9 w-full justify-center gap-2 rounded-lg border-0 bg-[#D4D4D8]/80 text-[14px] leading-4 font-semibold text-black"
            onClick={() => activeItem && navigateToConfigurator(activeItem.collectionHandle, activeItem.slug)}
            disabled={!activeItem?.collectionHandle}
          >
            <SvgIcon name="plus" className="size-3.5" />
            {CHECKOUT_ADD_MORE_PRODUCTS_LABEL}
          </Button>
          <Button
            size="sm"
            className="h-9 w-full justify-center gap-2 rounded-lg border-0 bg-linear-to-r from-black via-[#DC2C6F] to-[#E9CC76] text-[14px] leading-4 font-semibold text-white"
            disabled={isSubmitting}
            onClick={submitCheckout}
          >
            <SvgIcon name="cart" className="size-3.5" />
            {isSubmitting ? 'Attendere…' : CHECKOUT_COMPLETE_CONFIG_LABEL}
          </Button>
        </Flex>
      </Flex>

      <CheckoutSummaryPanel />
    </Grid>
  );
};

export { CheckoutView };
