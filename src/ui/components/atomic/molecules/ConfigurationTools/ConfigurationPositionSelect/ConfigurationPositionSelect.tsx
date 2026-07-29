'use client';

import { useState } from 'react';

import { Flex, SvgIcon, Text } from '@atoms';
import { ConfigurationPositionPickerModal } from '@molecules/ConfigurationTools/ConfigurationPositionPickerModal';

import { CONFIGURATOR_POSITION_SELECT_PLACEHOLDER } from '@constants';
import type { configurationPositionSelectPropsType } from '@types';

const ConfigurationPositionSelect = ({
  label,
  title,
  description,
  positions,
  onSelect,
  placeholder = CONFIGURATOR_POSITION_SELECT_PLACEHOLDER,
}: configurationPositionSelectPropsType) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const hasSelectablePositions = positions.some((position) => !position.disabled);

  const handleSelect = (positionKey: string) => {
    onSelect(positionKey);
    setIsModalOpen(false);
  };

  return (
    <Flex variant="configurator_part">
      <Text variant="configurator_control_label">{label}</Text>
      <button
        type="button"
        disabled={!hasSelectablePositions}
        onClick={() => setIsModalOpen(true)}
        className="cursor-pointer w-full h-10 max-xl:h-8 max-sm:h-8.75 flex items-center justify-between border border-input-border rounded-[8px] max-xl:rounded-[6.5px] max-sm:rounded-[7.5px] px-3 max-xl:px-2.5 text-sm max-xl:text-[13px] bg-white text-default disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="text-gray-30">{placeholder}</span>
        <SvgIcon name="plus" className="size-4 max-xl:size-3.25" />
      </button>

      <ConfigurationPositionPickerModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        title={title ?? label}
        description={description}
        positions={positions}
        onSelect={handleSelect}
      />
    </Flex>
  );
};

export { ConfigurationPositionSelect };
