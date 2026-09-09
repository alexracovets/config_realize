'use client';

import type { colorTabControlPropsType } from '@types';
import { PatternLayerColorControl } from '@molecules/ConfigurationTools/PatternLayerColorControl';

const TEXT_LAYER_KEY = 'colori';
const STROKE_LAYER_KEY = 'contorno';

const ColorTabControl = ({
  textColor,
  strokeColor,
  onTextColor,
  onStrokeColor,
  onPreviewTextColor,
  onPreviewStrokeColor,
  label = 'Colore',
}: colorTabControlPropsType) => (
  <PatternLayerColorControl
    label={label}
    layers={[
      { key: TEXT_LAYER_KEY, label: 'Testo' },
      { key: STROKE_LAYER_KEY, label: 'Contorno' },
    ]}
    colors={{ [TEXT_LAYER_KEY]: textColor, [STROKE_LAYER_KEY]: strokeColor }}
    onColorChange={(layerKey, color) => {
      if (layerKey === TEXT_LAYER_KEY) onTextColor(color);
      else onStrokeColor(color);
    }}
    onPreviewColorChange={
      onPreviewTextColor || onPreviewStrokeColor
        ? (layerKey, color) => {
            if (layerKey === TEXT_LAYER_KEY) onPreviewTextColor?.(color);
            else onPreviewStrokeColor?.(color);
          }
        : undefined
    }
  />
);

export { ColorTabControl };
