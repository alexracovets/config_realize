'use client';

import { Flex, Text } from '@atoms';
import type { partColorSwitchPropsType } from '@types';

const PartColorSwitch = ({ color, label, statusLabel }: partColorSwitchPropsType) => {
  return (
    <Flex className="flex-1 min-w-0 items-center justify-start gap-3 text-inherit max-xl:gap-2.5 max-sm:gap-2">
      <Flex className="min-w-0 items-center gap-2 max-xl:gap-1.5">
        <div className="w-5 h-5 rounded-[3px] shrink-0 border-[.3px] border-gray-30 transition-colors duration-150 max-xl:w-4 max-xl:h-4" style={{ background: color }} />
        <Text variant="configurator_part_label">{label}</Text>
      </Flex>
      {statusLabel && (
        <Text variant="configurator_control_label" className="shrink-0">
          {statusLabel}
        </Text>
      )}
    </Flex>
  );
};

export { PartColorSwitch };
