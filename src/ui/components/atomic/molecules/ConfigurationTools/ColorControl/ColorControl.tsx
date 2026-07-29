'use client';

import { memo } from 'react';

import { AtomInputHex, Button, ColorPicker, Flex, Grid, SvgIcon, Text } from '@atoms';
import { ColorPaletteCarousel } from '@molecules/ConfigurationTools/ColorPaletteCarousel';
import { PALETTE_COLORS } from '@constants';
import type { colorControlPropsType } from '@types';

const ColorControl = memo(({ color, label, onSelect, onPreviewSelect }: colorControlPropsType) => {
  return (
    <Flex variant="configurator_part">
      <Flex className="flex-col gap-3 max-xl:gap-2.5 w-full max-sm:flex-row max-sm:items-center max-sm:justify-between max-sm:gap-2">
        {label && <Text variant="configurator_control_label">{label}</Text>}
        <Grid className="grid-cols-[auto_auto] items-center justify-between gap-2 max-xl:gap-1.5 w-full max-sm:w-auto max-sm:grid-cols-1">
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
          <div className="max-sm:hidden">
            <AtomInputHex value={color} onChange={(value) => onSelect?.(value)} />
          </div>
        </Grid>
      </Flex>
      <Grid variant="select_parts" className="max-sm:hidden">
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
      <div className="hidden w-full min-w-0 max-sm:block">
        <ColorPaletteCarousel color={color} onSelect={onSelect} />
      </div>
    </Flex>
  );
});

ColorControl.displayName = 'ColorControl';

export { ColorControl };
