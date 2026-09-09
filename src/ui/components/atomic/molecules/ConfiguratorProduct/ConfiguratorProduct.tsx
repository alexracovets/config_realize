'use client';

import { memo } from 'react';

import { Box, Flex, Grid, Text } from '@atoms';

import { useShowConfigurationSkeleton } from '@hooks';
import { ConfiguratorProductSkeleton } from '@skeletons';
import { buildMinimumQuantityLabel, buildVolumeDiscountLabel } from '@constants';
import { priceFormat } from '@utils';
import { useConfigurationControl, useConfiguratorProduct } from '@store';

const ConfiguratorProduct = memo(({ className }: { className?: string }) => {
  const { price, name, minimumCount, bonusCount, bonusDiscount } = useConfiguratorProduct((state) => state.business);
  const showMinimumQuantity = minimumCount > 0;
  const showVolumeDiscount = bonusCount > 0 && bonusDiscount > 0;
  const numberProduct = useConfigurationControl((state) => state.numberProduct);
  const showSkeleton = useShowConfigurationSkeleton();

  if (showSkeleton) {
    return (
      <Box className={className}>
        <ConfiguratorProductSkeleton />
      </Box>
    );
  }

  return (
    <Flex variant="configurator_product_root" className={className}>
      <Grid variant="configurator_product_header">
        <Text variant="product_name" asChild>
          <h3>{name}</h3>
        </Text>
        <Flex variant="configurator_product_badge">
          <Text variant="configurator_product_badge_title">Prodotto {numberProduct}</Text>
          {showMinimumQuantity ? <Text variant="configurator_product_minimum">{buildMinimumQuantityLabel(minimumCount)}</Text> : null}
        </Flex>
      </Grid>
      <Grid variant="configurator_price">
        <Text variant="product_price">{priceFormat(price)}</Text>
        {showVolumeDiscount ? <Text variant="configurator_product_volume_discount">{buildVolumeDiscountLabel(bonusCount)}</Text> : null}
      </Grid>
    </Flex>
  );
});

ConfiguratorProduct.displayName = 'ConfiguratorProduct';

export { ConfiguratorProduct };
