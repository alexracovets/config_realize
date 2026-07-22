'use client';

import { Button, Flex, Grid, SvgIcon, Text } from '@atoms';

import { CHECKOUT_ADD_MORE_PRODUCTS_LABEL, CHECKOUT_EMPTY_CART_LABEL } from '@constants';
import { useAppNavigate, useNavigateToConfigurator } from '@hooks';
import { CheckoutOrderExport, CheckoutProductCard, CheckoutSummaryPanel, OrderCuttingExport } from '@molecules';
import { useCheckout, useConfigurationCart } from '@store';

const CheckoutView = () => {
  const { navigateToConfigurator } = useNavigateToConfigurator();
  const { navigateToAppPath } = useAppNavigate();
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
    <Grid className="min-h-0 flex-1 grid-cols-[minmax(0,1fr)_400px] items-start gap-8">
      <Flex className="min-w-0 w-full flex-col items-start justify-start gap-6 pt-9">
        {products.map((product) => (
          <CheckoutProductCard key={product.cartItemId} product={product} />
        ))}
        <CheckoutOrderExport />
        <OrderCuttingExport />
        <Button
          size="sm"
          className="self-start border border-gray-20 bg-white"
          onClick={() => activeItem && navigateToConfigurator(activeItem.collectionHandle, activeItem.slug)}
          disabled={!activeItem?.collectionHandle}
        >
          <SvgIcon name="plus" />
          {CHECKOUT_ADD_MORE_PRODUCTS_LABEL}
        </Button>
      </Flex>

      <CheckoutSummaryPanel />
    </Grid>
  );
};

export { CheckoutView };
