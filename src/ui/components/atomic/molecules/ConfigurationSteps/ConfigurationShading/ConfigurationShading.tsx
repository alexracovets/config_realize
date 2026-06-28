'use client';

import { PartColorSwitch } from '@molecules/ConfigurationTools/PartColorSwitch';
import { ShadingControl } from '@molecules/ConfigurationTools/ShadingControl';
import { AccordionAtom, Flex } from '@atoms';
import { CONFIGURATOR_GRADIENT_ACTIVE_LABEL } from '@constants';
import { DEFAULT_COLOR, useConfiguratorProduct, useGarmentColor } from '@store';
import { useCallback, useMemo } from 'react';
const ConfigurationShading = () => {
  const product = useConfiguratorProduct((state) => state.product);
  const byPart = useGarmentColor((state) => state.byPart);
  const gradientsByPart = useGarmentColor((state) => state.gradientsByPart);
  const parts = useMemo(() => product.parts.filter((part) => !part.colorOnly), [product.parts]);

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

  if (parts.length === 0) return null;

  return (
    <Flex key={product.path} variant="step_design">
      <AccordionAtom items={items} defaultValue={[parts[0].id]} multiple className="gap-3" />
    </Flex>
  );
};

export { ConfigurationShading };
