'use client';

import { Box, Button, Flex, Text } from '@atoms';
import type { toggleControlPropsType } from '@types';

const ToggleControl = ({ label, active, onChange }: toggleControlPropsType) => {
  return (
    <Flex variant="between_aligned_full">
      <Text variant="configurator_control_label">{label}</Text>
      <Button onClick={() => onChange(!active)} variant="toggle" data-active={active}>
        <Box variant="toggle_handle" data-active={active} />
      </Button>
    </Flex>
  );
};

export { ToggleControl };
