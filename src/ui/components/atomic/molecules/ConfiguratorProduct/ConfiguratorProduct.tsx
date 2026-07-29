'use client';

import { memo } from 'react';

import { Flex, Grid, Text } from '@atoms';

import { useShowConfigurationSkeleton } from '@hooks';
import { ConfiguratorProductSkeleton } from '@skeletons';
import { buildMinimumQuantityLabel, buildVolumeDiscountLabel } from '@constants';
import { cn, priceFormat } from '@utils';
import { useConfigurationControl, useConfiguratorProduct } from '@store';

const ConfiguratorProduct = memo(({ className }: { className?: string }) => {
  const { price, name, minimumCount, bonusCount, bonusDiscount } = useConfiguratorProduct((state) => state.business);
  const showMinimumQuantity = minimumCount > 0;
  const showVolumeDiscount = bonusCount > 0 && bonusDiscount > 0;
  const numberProduct = useConfigurationControl((state) => state.numberProduct);
  const showSkeleton = useShowConfigurationSkeleton();

  if (showSkeleton) {
    return (
      <div className={className}>
        <ConfiguratorProductSkeleton />
      </div>
    );
  }

  return (
    <Flex className={cn('flex-col items-start w-full gap-3 max-xl:gap-2.5', className)}>
      <Grid className="grid-cols-[1fr_auto] gap-3 max-xl:gap-2.5 max-sm:items-center">
        <Text variant="product_name" asChild>
          <h3>{name}</h3>
        </Text>
        <Flex className="flex-col items-start px-3 py-2 rounded-sm bg-primary hover:bg-primary/90 transition-colors max-xl:px-2.5 max-xl:py-1.5 max-sm:flex-row max-sm:items-center max-sm:gap-1 max-sm:px-2 max-sm:py-1">
          <Text className="font-semibold max-xl:text-[13px] max-sm:text-[12px] max-sm:leading-4">Prodotto {numberProduct}</Text>
          {showMinimumQuantity ? (
            <Text className="text-[14px] text-gray max-xl:text-[11px] max-sm:text-[12px] max-sm:leading-3.75 max-sm:text-[#6B7280]">{buildMinimumQuantityLabel(minimumCount)}</Text>
          ) : null}
        </Flex>
      </Grid>
      <Grid variant="configurator_price">
        <Text variant="product_price">{priceFormat(price)}</Text>
        {showVolumeDiscount ? (
          <Text className="text-[#6B7280] font-medium max-xl:text-[11px] max-sm:text-[12px] max-sm:leading-3.75 max-sm:font-normal">{buildVolumeDiscountLabel(bonusCount, bonusDiscount)}</Text>
        ) : null}
      </Grid>
    </Flex>
  );
});

ConfiguratorProduct.displayName = 'ConfiguratorProduct';

export { ConfiguratorProduct };
