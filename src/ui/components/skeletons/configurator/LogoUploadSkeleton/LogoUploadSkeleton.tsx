'use client';

import { AtomSkeleton, Flex, Grid } from '@atoms';

const LogoUploadSkeleton = () => {
  return (
    <Flex variant="skeleton_logo_upload_column" data-testid="skeleton-logo-upload">
      <AtomSkeleton className="h-[15px] w-12" />
      <AtomSkeleton className="h-[72px] w-full rounded-[8px]" data-testid="skeleton-logo-dropzone" />
      <Grid variant="skeleton_logo_info_panel">
        <AtomSkeleton className="size-4 shrink-0 rounded-full" />
        <AtomSkeleton className="h-3 w-full" />
      </Grid>
    </Flex>
  );
};

export { LogoUploadSkeleton };
