'use client';

import { AtomSkeleton, Flex, Grid } from '@atoms';

const ConfiguratorProductSkeleton = () => {
  return (
    <Flex variant="skeleton_configurator_root" data-testid="skeleton-configurator-product">
      <Grid variant="skeleton_configurator_header">
        <AtomSkeleton className="h-8 w-[200px]" data-testid="skeleton-product-name" />
        <Flex variant="skeleton_configurator_meta">
          <AtomSkeleton className="h-4 w-[88px]" />
          <AtomSkeleton className="h-3.5 w-[72px]" />
        </Flex>
      </Grid>
      <Grid variant="configurator_price_spaced">
        <AtomSkeleton className="h-10 w-[100px]" data-testid="skeleton-product-price" />
        <AtomSkeleton className="h-4 w-[180px]" />
      </Grid>
    </Flex>
  );
};

export { ConfiguratorProductSkeleton };
