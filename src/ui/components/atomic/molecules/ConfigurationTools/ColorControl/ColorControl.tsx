'use client';

import { memo } from 'react';

import { AtomInputHex, Button, ColorPicker, Flex, Grid, SvgIcon, Text } from '@atoms';
import { PALETTE_COLORS } from '@constants';
import type { colorControlPropsType } from '@types';

const ColorControl = memo(({ color, label, onSelect, onPreviewSelect }: colorControlPropsType) => {
  return (
    <Flex variant="configurator_part">
      {label && <Text variant="configurator_control_label">{label}</Text>}
      <Grid className="grid-cols-[auto_auto] items-center justify-between gap-2 w-full">
        <ColorPicker
          color={color}
          onChange={(value) => onSelect?.(value)}
          onPreviewChange={(value) => onPreviewSelect?.(value)}
          trigger={
            <Button variant="destructive" size="icon">
              <span>Seleziona il colore</span>
              <SvgIcon name="select_color" />
            </Button>
          }
        />
        <AtomInputHex value={color} onChange={(value) => onSelect?.(value)} />
      </Grid>
      <Grid variant="select_parts">
        {PALETTE_COLORS.map((paletteColor) => (
          <Button
            key={paletteColor}
            variant="select_part_short"
            data-active={color === paletteColor}
            style={{ backgroundColor: paletteColor }}
            onClick={() => onSelect?.(paletteColor)}
          />
        ))}
      </Grid>
    </Flex>
  );
});

ColorControl.displayName = 'ColorControl';

export { ColorControl };
