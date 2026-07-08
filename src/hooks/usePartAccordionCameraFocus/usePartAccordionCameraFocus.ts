'use client';

import { requestConfiguratorCameraFocus } from '@configurator';
import { resolvePartCenterUv } from '@configurator/mappers';
import { useConfiguratorProduct } from '@store';
import { useCallback, useState } from 'react';

interface usePartAccordionCameraFocusOptionsType {
  partIds: readonly string[];
  defaultOpenPartIds?: readonly string[];
}

const usePartAccordionCameraFocus = ({ partIds, defaultOpenPartIds }: usePartAccordionCameraFocusOptionsType) => {
  const parts = useConfiguratorProduct((state) => state.product.parts);
  const defaultPartId = partIds[0] ?? null;
  const [openItems, setOpenItems] = useState(() => [...(defaultOpenPartIds ?? (defaultPartId ? [defaultPartId] : []))]);

  const handleItemActivate = useCallback(
    (partId: string) => {
      if (!partIds.includes(partId)) return;

      const part = parts.find((item) => item.id === partId);
      if (!part) return;

      requestConfiguratorCameraFocus({ partId, uv: resolvePartCenterUv(part) });
    },
    [partIds, parts],
  );

  const handleOpenItemsChange = useCallback((value: string[]) => {
    setOpenItems([...value]);
  }, []);

  return {
    openItems,
    handleItemActivate,
    handleOpenItemsChange,
  };
};

export { usePartAccordionCameraFocus };
