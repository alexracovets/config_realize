'use client';

import { AtomSkeleton, Box, Flex } from '@atoms';

import { LogoUploadSkeleton } from '@skeletons';

const ConfigurationLogoStepSkeleton = () => {
  return (
    <Flex variant="step_design_logo_column" data-testid="skeleton-step-logo">
      <LogoUploadSkeleton />
      <Flex variant="skeleton_column_full_gap3">
        <AtomSkeleton className="h-[15px] w-28" />
        <Box variant="skeleton_card_surface">
          <Flex variant="skeleton_column_full_gap2">
            <Flex variant="skeleton_row_center_gap2">
              <AtomSkeleton className="size-4 shrink-0" />
              <AtomSkeleton className="h-4 w-24" />
            </Flex>
            <AtomSkeleton className="h-8 w-full" />
          </Flex>
        </Box>
        <Flex variant="skeleton_hint_row">
          <AtomSkeleton className="size-4 shrink-0" />
          <AtomSkeleton className="h-4 w-40" />
        </Flex>
      </Flex>
    </Flex>
  );
};

export { ConfigurationLogoStepSkeleton };
