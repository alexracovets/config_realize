'use client';

import { AtomSkeleton, Flex, Grid } from '@atoms';

const ConfiguratorProductSkeleton = () => {
  return (
    <Flex className="w-full min-w-0 flex-col" data-testid="skeleton-configurator-product">
      <Grid className="w-full grid-cols-[1fr_auto] gap-3">
        <AtomSkeleton className="h-8 w-[200px]" data-testid="skeleton-product-name" />
        <Flex className="flex-col gap-2 px-3 py-2">
          <AtomSkeleton className="h-4 w-[88px]" />
          <AtomSkeleton className="h-3.5 w-[72px]" />
        </Flex>
      </Grid>
      <Grid variant="configurator_price" className="mt-3">
        <AtomSkeleton className="h-10 w-[100px]" data-testid="skeleton-product-price" />
        <AtomSkeleton className="h-4 w-[180px]" />
      </Grid>
    </Flex>
  );
};

export { ConfiguratorProductSkeleton };
