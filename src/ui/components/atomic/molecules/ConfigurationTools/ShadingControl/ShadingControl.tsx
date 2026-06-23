'use client';

import { Flex, Text } from '@atoms';
import { ColorControl } from '../ColorControl';
import { RangeControl } from '../RangeControl';
import { ToggleControl } from '../ToggleControl';
import { DEFAULT_COLOR, DISABLED_PART_GRADIENT, useGarmentColor } from '@store';
import type { shadingControlPropsType } from '@types';

const ShadingControl = ({ partId }: shadingControlPropsType) => {
  const baseColor = useGarmentColor((state) => state.byPart[partId] ?? DEFAULT_COLOR);
  const gradient = useGarmentColor((state) => state.gradientsByPart[partId] ?? DISABLED_PART_GRADIENT);
  const setPartGradientEnabled = useGarmentColor((state) => state.setPartGradientEnabled);
  const setPartGradientColor2 = useGarmentColor((state) => state.setPartGradientColor2);
  const setPartGradientRotation = useGarmentColor((state) => state.setPartGradientRotation);
  const setPartGradientPosition = useGarmentColor((state) => state.setPartGradientPosition);
  const setPartGradientSoftness = useGarmentColor((state) => state.setPartGradientSoftness);
  const setPartGradientOpacity = useGarmentColor((state) => state.setPartGradientOpacity);

  return (
    <Flex variant="configurator_part">
      <ToggleControl label="Sfumatura" active={gradient.enabled} onChange={(enabled) => setPartGradientEnabled(partId, enabled)} />

      {gradient.enabled && (
        <>
          <Flex className="gap-2 items-start flex-col">
            <Text variant="configurator_control_label">Colore primario</Text>
            <div className="w-15 h-15 rounded-[8px] shrink-0 border-[.2px] border-gray-30 transition-colors duration-150" style={{ background: baseColor }} />
          </Flex>
          <ColorControl
            label="Colore sfumatura"
            color={gradient.color2}
            onSelect={(color) => setPartGradientColor2(partId, color)}
            onPreviewSelect={(color) => setPartGradientColor2(partId, color)}
          />
          <RangeControl
            label="Rotazione"
            value={Math.round(gradient.rotation)}
            onChange={(value) => setPartGradientRotation(partId, value)}
            min={0}
            max={360}
            unit="°"
          />
          <RangeControl
            label="Posizione"
            value={Math.round(gradient.position * 100)}
            onChange={(value) => setPartGradientPosition(partId, value / 100)}
            min={0}
            max={100}
            unit="%"
          />
          <RangeControl
            label="Morbidezza"
            value={Math.round(gradient.softness * 100)}
            onChange={(value) => setPartGradientSoftness(partId, value / 100)}
            min={0}
            max={100}
            unit="%"
          />
          <RangeControl
            label="Trasparenza"
            value={Math.round(gradient.opacity * 100)}
            onChange={(value) => setPartGradientOpacity(partId, value / 100)}
            min={0}
            max={100}
            unit="%"
          />
        </>
      )}
    </Flex>
  );
};

export { ShadingControl };
