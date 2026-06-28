'use client';

import type { colorTabControlPropsType, colorTabType, colorTabVariantType } from '@types';
import { Flex, Text } from '@atoms';
import { ColorControl } from '@molecules/ConfigurationTools/ColorControl';
import { cn } from '@utils';
import { useState } from 'react';
const COLOR_TABS_BY_VARIANT: Record<colorTabVariantType, { id: colorTabType; label: string }[]> = {
  design: [
    { id: 'colori', label: 'Colore 1' },
    { id: 'contorno', label: 'Colore 2' },
  ],
  text: [
    { id: 'colori', label: 'Testo' },
    { id: 'contorno', label: 'Carattere' },
  ],
};

const ColorTabControl = ({
  textColor,
  strokeColor,
  onTextColor,
  onStrokeColor,
  onPreviewTextColor,
  onPreviewStrokeColor,
  label = 'Colore',
  tabVariant = 'design',
}: colorTabControlPropsType) => {
  const [colorTab, setColorTab] = useState<colorTabType>('colori');

  const colors: Record<colorTabType, string> = { colori: textColor, contorno: strokeColor };
  const colorTabs = COLOR_TABS_BY_VARIANT[tabVariant];

  return (
    <Flex variant="configurator_part">
      <Text variant="configurator_control_label">{label}</Text>
      <div className="flex w-full border-b border-gray-200">
        {colorTabs.map(({ id, label: tabLabel }) => (
          <button
            key={id}
            onClick={() => setColorTab(id)}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-inter font-medium',
              'border-b-2 -mb-px transition-colors duration-200 cursor-pointer',
              colorTab === id ? 'border-default text-default' : 'border-transparent text-gray hover:text-default',
            )}
          >
            <div className="w-5 h-5 rounded-[3px] shrink-0 border-[.3px] border-gray-30 transition-colors duration-150" style={{ background: colors[id] }} />
            {tabLabel}
          </button>
        ))}
      </div>
      {colorTab === 'colori' && <ColorControl color={textColor} onSelect={onTextColor} onPreviewSelect={onPreviewTextColor} />}
      {colorTab === 'contorno' && <ColorControl color={strokeColor} onSelect={onStrokeColor} onPreviewSelect={onPreviewStrokeColor} />}
    </Flex>
  );
};

export { ColorTabControl };
