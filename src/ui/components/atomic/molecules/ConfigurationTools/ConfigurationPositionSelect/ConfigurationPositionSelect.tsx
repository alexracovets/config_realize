'use client';

import { useMemo, useState } from 'react';

import { AtomSelect, Flex, Text } from '@atoms';

import { CONFIGURATOR_POSITION_SELECT_PLACEHOLDER } from '@constants';
import type { configurationPositionSelectPropsType } from '@types';

const PLACEHOLDER_VALUE = '__position_placeholder__';

const ConfigurationPositionSelect = ({
  label,
  positions,
  onSelect,
  placeholder = CONFIGURATOR_POSITION_SELECT_PLACEHOLDER,
}: configurationPositionSelectPropsType) => {
  const [pickerKey, setPickerKey] = useState(0);
  const placeholderOption = useMemo(() => ({ label: placeholder, value: PLACEHOLDER_VALUE, disabled: true }), [placeholder]);

  const options = useMemo(
    () => [placeholderOption, ...positions.map((position) => ({ label: position.label, value: position.key }))],
    [placeholderOption, positions],
  );

  return (
    <Flex variant="configurator_part">
      <Text variant="configurator_control_label">{label}</Text>
      <AtomSelect
        key={pickerKey}
        variant="position"
        icon
        disabled={positions.length === 0}
        options={positions.length === 0 ? [placeholderOption] : options}
        value={placeholderOption}
        onChange={(option) => {
          if (option.value === PLACEHOLDER_VALUE) return;

          onSelect(option.value);
          setPickerKey((current) => current + 1);
        }}
      />
    </Flex>
  );
};

export { ConfigurationPositionSelect };
