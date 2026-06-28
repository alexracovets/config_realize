'use client';

import { Button, Flex, Grid, SvgIcon } from '@atoms';

import { useNavigateToConfigurator } from '@hooks';
import { CheckoutProductCard, CheckoutSummaryPanel } from '@molecules';
import { useCheckout, useConfigurationCart } from '@store';

const CheckoutView = () => {
  const { navigateToConfigurator } = useNavigateToConfigurator();
  const products = useCheckout((state) => state.products);
  const activeItem = useConfigurationCart((state) => state.items.find((item) => item.id === state.activeItemId) ?? state.items[0]);

  return (
    <Grid className="grid-cols-[minmax(0,1fr)_380px]">
      <Flex className="min-w-0 w-full flex-col items-start justify-start gap-6 pt-9">
        {products.map((product) => (
          <CheckoutProductCard key={product.cartItemId} product={product} />
        ))}
        <Button
          size="sm"
          className="self-start border border-gray-20 bg-white"
          onClick={() => activeItem && navigateToConfigurator(activeItem.collectionHandle, activeItem.slug)}
          disabled={!activeItem?.collectionHandle}
        >
          <SvgIcon name="plus" />
          Aggiungi altri prodotti
        </Button>
      </Flex>

      <CheckoutSummaryPanel />
    </Grid>
  );
};

export { CheckoutView };
