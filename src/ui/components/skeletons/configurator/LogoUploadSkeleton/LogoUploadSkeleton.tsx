'use client';

import { AtomSkeleton, Flex, Grid } from '@atoms';

const LogoUploadSkeleton = () => {
  return (
    <Flex className="w-full flex-col items-start gap-2" data-testid="skeleton-logo-upload">
      <AtomSkeleton className="h-[15px] w-12" />
      <AtomSkeleton className="h-[72px] w-full rounded-[8px]" data-testid="skeleton-logo-dropzone" />
      <Grid className="grid w-full grid-cols-[auto_1fr] items-center gap-2.5 rounded-[4px] p-2">
        <AtomSkeleton className="size-4 shrink-0 rounded-full" />
        <AtomSkeleton className="h-3 w-full" />
      </Grid>
    </Flex>
  );
};

export { LogoUploadSkeleton };
