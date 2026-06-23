'use client';

import { useState } from 'react';

import { Flex, Text } from '@atoms';
import { ColorControl } from '../ColorControl';

import type { patternLayerColorControlPropsType } from '@types';
import { cn } from '@utils';

const PatternLayerColorControl = ({ layers, colors, onColorChange, onPreviewColorChange, label = 'Colore design' }: patternLayerColorControlPropsType) => {
  const [activeLayerKey, setActiveLayerKey] = useState(layers[0]?.key ?? '');

  const activeLayer = layers.find((layer) => layer.key === activeLayerKey) ?? layers[0];

  if (layers.length === 0) return null;

  return (
    <Flex variant="configurator_part">
      <Text variant="configurator_control_label">{label}</Text>
      <div className="flex w-full border-b border-gray-200">
        {layers.map((layer) => (
          <button
            key={layer.key}
            type="button"
            onClick={() => setActiveLayerKey(layer.key)}
            className={cn(
              'flex-1 flex items-center justify-center py-2.5 text-sm font-inter font-medium',
              'border-b-2 -mb-px transition-colors duration-200 cursor-pointer',
              activeLayerKey === layer.key ? 'border-default text-default' : 'border-transparent text-gray hover:text-default',
            )}
          >
            {layer.label}
          </button>
        ))}
      </div>
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
