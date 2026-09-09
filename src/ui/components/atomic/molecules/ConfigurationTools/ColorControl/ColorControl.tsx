'use client';

import { memo } from 'react';

import { AtomInputHex, Box, Button, ColorPicker, Flex, Grid, SvgIcon, Text } from '@atoms';
import { ColorPaletteCarousel } from '@molecules/ConfigurationTools/ColorPaletteCarousel';
import { PALETTE_COLORS } from '@constants';
import type { colorControlPropsType } from '@types';

const ColorControl = memo(({ color, label, onSelect, onPreviewSelect, restrictedColors }: colorControlPropsType) => {
  const colors = restrictedColors ?? PALETTE_COLORS;

  return (
    <Flex variant="configurator_part">
      {!restrictedColors && (
        <Flex variant="color_control_panel">
          {label && <Text variant="configurator_control_label">{label}</Text>}
          <Grid variant="color_control_actions">
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
            <Box variant="hidden_mobile">
              <AtomInputHex value={color} onChange={(value) => onSelect?.(value)} />
            </Box>
          </Grid>
        </Flex>
      )}
      <Grid variant="select_parts_mobile_hidden">
        {colors.map((paletteColor) => (
          <Button
            key={paletteColor}
            variant="select_part_short"
            data-active={color === paletteColor}
            style={{ backgroundColor: paletteColor }}
            onClick={() => onSelect?.(paletteColor)}
          />
        ))}
      </Grid>
      <Box variant="palette_carousel_mobile">
        <ColorPaletteCarousel color={color} onSelect={onSelect} colors={colors} />
      </Box>
    </Flex>
  );
});

ColorControl.displayName = 'ColorControl';

export { ColorControl };
