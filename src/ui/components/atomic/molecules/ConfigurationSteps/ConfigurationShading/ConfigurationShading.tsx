'use client';

import { PartColorSwitch } from '@molecules/ConfigurationTools/PartColorSwitch';
import { ShadingControl } from '@molecules/ConfigurationTools/ShadingControl';
import { AccordionAtom, Flex } from '@atoms';
import { CONFIGURATOR_GRADIENT_ACTIVE_LABEL } from '@constants';
import { usePartAccordionCameraFocus } from '@hooks';
import type { garmentPartConfigType } from '@types';
import { DEFAULT_COLOR, useConfiguratorProduct, useGarmentColor } from '@store';
import { useCallback, useMemo } from 'react';

interface configurationShadingAccordionPropsType {
  parts: garmentPartConfigType[];
  partIds: string[];
}

const ConfigurationShadingAccordion = ({ parts, partIds }: configurationShadingAccordionPropsType) => {
  const byPart = useGarmentColor((state) => state.byPart);
  const gradientsByPart = useGarmentColor((state) => state.gradientsByPart);
  const { openItems, handleItemActivate, handleOpenItemsChange } = usePartAccordionCameraFocus({
    partIds,
    defaultOpenPartIds: partIds[0] ? [partIds[0]] : [],
  });

  const getShadingPreview = useCallback(
    (partId: string) => {
      const baseColor = byPart[partId] ?? DEFAULT_COLOR;
      const gradient = gradientsByPart[partId];

      if (!gradient?.enabled) return baseColor;

      const color1 = gradient.reversed ? gradient.color2 : baseColor;
      const color2 = gradient.reversed ? baseColor : gradient.color2;

      return `linear-gradient(${gradient.rotation}deg, ${color1}, ${color2})`;
    },
    [byPart, gradientsByPart],
  );

  const items = useMemo(
    () =>
      parts.map((part) => ({
        value: part.id,
        trigger: (
          <PartColorSwitch
            color={getShadingPreview(part.id)}
            label={part.label}
            statusLabel={gradientsByPart[part.id]?.enabled ? CONFIGURATOR_GRADIENT_ACTIVE_LABEL : undefined}
          />
        ),
        content: <ShadingControl partId={part.id} />,
      })),
    [getShadingPreview, gradientsByPart, parts],
  );

  return <AccordionAtom items={items} value={openItems} onValueChange={handleOpenItemsChange} onItemActivate={handleItemActivate} multiple className="gap-3" />;
};

const ConfigurationShading = () => {
  const product = useConfiguratorProduct((state) => state.product);
  const parts = useMemo(() => product.parts.filter((part) => !part.colorOnly), [product.parts]);
  const partIds = useMemo(() => parts.map((part) => part.id), [parts]);

  if (parts.length === 0) return null;

  return (
    <Flex variant="step_design">
      <ConfigurationShadingAccordion key={product.path} parts={parts} partIds={partIds} />
    </Flex>
  );
};

export { ConfigurationShading };
