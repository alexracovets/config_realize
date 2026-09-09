'use client';

import { Flex, Text } from '@atoms';
import type { partColorSwitchPropsType } from '@types';

const PartColorSwitch = ({ color, label, statusLabel }: partColorSwitchPropsType) => {
  return (
    <Flex variant="part_color_switch_row">
      <Flex variant="part_color_switch_inner">
        <div
          className="w-5 h-5 rounded-[3px] shrink-0 border-[.3px] border-gray-30 transition-colors duration-150 max-xl:w-4 max-xl:h-4"
          style={{ background: color }}
        />
        <Text variant="configurator_part_label">{label}</Text>
      </Flex>
      {statusLabel && <Text variant="configurator_control_label_shrink">{statusLabel}</Text>}
    </Flex>
  );
};

export { PartColorSwitch };
