'use client';

import type { patternLayerColorControlPropsType } from '@types';
import { Box, Flex, Text } from '@atoms';
import { ColorControl } from '@molecules/ConfigurationTools/ColorControl';
import { cn } from '@utils';
import { useState } from 'react';

const PatternLayerColorControl = ({ layers, colors, onColorChange, onPreviewColorChange, label = 'Colore design' }: patternLayerColorControlPropsType) => {
  const [activeLayerKey, setActiveLayerKey] = useState(layers[0]?.key ?? '');
  const activeLayer = layers.find((layer) => layer.key === activeLayerKey) ?? layers[0];

  if (layers.length === 0) return null;

  if (layers.length === 1) {
    const [layer] = layers;

    return (
      <ColorControl
        color={colors[layer.key] ?? '#000000'}
        onSelect={(color) => onColorChange(layer.key, color)}
        onPreviewSelect={onPreviewColorChange ? (color) => onPreviewColorChange(layer.key, color) : undefined}
        label={label}
      />
    );
  }

  return (
    <Flex variant="configurator_part">
      <Text variant="configurator_control_label">{label}</Text>
      <Flex variant="tab_control_header">
        {layers.map((layer) => (
          <button
            key={layer.key}
            type="button"
            onClick={() => setActiveLayerKey(layer.key)}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-inter font-medium',
              'max-xl:gap-1.5 max-xl:py-2 max-xl:text-[13px]',
              'border-b-2 -mb-px transition-colors duration-200 cursor-pointer',
              activeLayerKey === layer.key ? 'border-default text-default' : 'border-transparent text-gray hover:text-default',
            )}
          >
            <Box
              className="w-5 h-5 rounded-[3px] shrink-0 border-[.3px] border-gray-30 transition-colors duration-150 max-xl:w-4 max-xl:h-4"
              style={{ background: colors[layer.key] ?? '#000000' }}
            />
            {layer.label}
          </button>
        ))}
      </Flex>
      {activeLayer && (
        <ColorControl
          color={colors[activeLayer.key] ?? '#000000'}
          onSelect={(color) => onColorChange(activeLayer.key, color)}
          onPreviewSelect={onPreviewColorChange ? (color) => onPreviewColorChange(activeLayer.key, color) : undefined}
        />
      )}
    </Flex>
  );
};

export { PatternLayerColorControl };
