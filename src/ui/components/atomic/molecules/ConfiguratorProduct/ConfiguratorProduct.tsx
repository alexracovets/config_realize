'use client';

import { memo } from 'react';

import { Flex, Grid, Text } from '@atoms';

import { useShowConfigurationSkeleton } from '@hooks';
import { ConfiguratorProductSkeleton } from '@skeletons';
import { priceFormat } from '@utils';
import { useConfigurationControl, useConfiguratorProduct } from '@store';

const ConfiguratorProduct = memo(() => {
  const { price, name, bonusCount, minimumCount, bonusDiscount } = useConfiguratorProduct((state) => state.business);
  const numberProduct = useConfigurationControl((state) => state.numberProduct);
  const showSkeleton = useShowConfigurationSkeleton();

  if (showSkeleton) {
    return <ConfiguratorProductSkeleton />;
  }

  return (
    <Flex className="flex-col gap-3">
      <Grid className="grid-cols-[1fr_auto] gap-3">
        <Text variant="product_name" asChild>
          <h3>{name}</h3>
        </Text>
        <Flex className="flex-col items-start px-3 py-2 rounded-[4px] bg-primary hover:bg-primary/90 transition-colors">
          <Text className="font-semibold">Prodotto {numberProduct}</Text>
          <Text className="text-[14px] text-gray">Minimo {minimumCount ?? 0} pz</Text>
        </Flex>
      </Grid>
      <Grid variant="configurator_price">
        <Text variant="product_price">{priceFormat(price)}</Text>
        <Text className="text-[#6B7280] font-medium">{`>${bonusCount} pezzi +${bonusDiscount}% di sconto`}</Text>
      </Grid>
    </Flex>
  );
});

ConfiguratorProduct.displayName = 'ConfiguratorProduct';

export { ConfiguratorProduct };
