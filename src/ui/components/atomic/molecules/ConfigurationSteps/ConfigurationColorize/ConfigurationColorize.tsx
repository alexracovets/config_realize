'use client';

import { ColorControl } from '@molecules/ConfigurationTools/ColorControl';
import { PartColorSwitch } from '@molecules/ConfigurationTools/PartColorSwitch';
import type { garmentPartConfigType, partColorControlPropsType } from '@types';
import { AccordionAtom, Flex } from '@atoms';
import { usePartAccordionCameraFocus } from '@hooks';
import { DEFAULT_COLOR, useConfiguratorProduct, useGarmentColor } from '@store';
import { memo, useMemo } from 'react';

const PartColorControl = memo(({ partId }: partColorControlPropsType) => {
  const color = useGarmentColor((state) => state.byPart[partId] ?? DEFAULT_COLOR);
  const setPartColor = useGarmentColor((state) => state.setPartColor);

  return <ColorControl color={color} onSelect={(value) => setPartColor(partId, value)} onPreviewSelect={(value) => setPartColor(partId, value)} />;
});

PartColorControl.displayName = 'PartColorControl';

interface configurationColorizeAccordionPropsType {
  parts: garmentPartConfigType[];
  partIds: string[];
}

const ConfigurationColorizeAccordion = ({ parts, partIds }: configurationColorizeAccordionPropsType) => {
  const byPart = useGarmentColor((state) => state.byPart);
  const { openItems, handleItemActivate, handleOpenItemsChange } = usePartAccordionCameraFocus({
    partIds,
    defaultOpenPartIds: partIds[0] ? [partIds[0]] : [],
  });

  const items = useMemo(
    () =>
      parts.map((part) => ({
        value: part.id,
        trigger: <PartColorSwitch color={byPart[part.id] ?? DEFAULT_COLOR} label={part.label} />,
        content: <PartColorControl partId={part.id} />,
      })),
    [byPart, parts],
  );

  return (
    <AccordionAtom
      items={items}
      value={openItems}
      onValueChange={handleOpenItemsChange}
      onItemActivate={handleItemActivate}
      multiple
      className="gap-3"
    />
  );
};

const ConfigurationColorize = () => {
  const product = useConfiguratorProduct((state) => state.product);
  const parts = product.parts;
  const partIds = useMemo(() => parts.map((part) => part.id), [parts]);

  if (parts.length === 0) return null;

  return (
    <Flex variant="step_design">
      <ConfigurationColorizeAccordion key={product.path} parts={parts} partIds={partIds} />
    </Flex>
  );
};

export { ConfigurationColorize };
