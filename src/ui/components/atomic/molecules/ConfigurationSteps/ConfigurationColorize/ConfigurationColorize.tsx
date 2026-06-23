'use client';

import { memo, useMemo } from 'react';

import { AccordionAtom, Flex } from '@atoms';
import { ColorControl } from '../../ConfigurationTools/ColorControl';
import { PartColorSwitch } from '../../ConfigurationTools/PartColorSwitch';

import { DEFAULT_COLOR, useConfiguratorProduct, useGarmentColor } from '@store';
import type { partColorControlPropsType } from '@types';

const PartColorControl = memo(({ partId }: partColorControlPropsType) => {
  const color = useGarmentColor((state) => state.byPart[partId] ?? DEFAULT_COLOR);
  const setPartColor = useGarmentColor((state) => state.setPartColor);

  return <ColorControl color={color} onSelect={(value) => setPartColor(partId, value)} onPreviewSelect={(value) => setPartColor(partId, value)} />;
});

PartColorControl.displayName = 'PartColorControl';

const ConfigurationColorize = () => {
  const product = useConfiguratorProduct((state) => state.product);
  const byPart = useGarmentColor((state) => state.byPart);
  const parts = product.parts;

  const items = useMemo(
    () =>
      parts.map((part) => ({
        value: part.id,
        trigger: <PartColorSwitch color={byPart[part.id] ?? DEFAULT_COLOR} label={part.label} />,
        content: <PartColorControl partId={part.id} />,
      })),
    [byPart, parts],
  );

  if (parts.length === 0) return null;

  return (
    <Flex variant="step_design">
      <AccordionAtom key={product.path} items={items} defaultValue={[parts[0].id]} multiple className="gap-3" />
    </Flex>
  );
};

export { ConfigurationColorize };
