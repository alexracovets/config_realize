'use client';

import { memo, useMemo } from 'react';

import type { printGizmoInstancePropsType } from '@configurator/types';
import { usePrintGizmoDrag } from '@configurator/hooks';
import { useConfiguratorProduct } from '@store';
import { resolvePrintAtlasSize } from '@configurator/utils';

const PrintGizmoInstance = memo(({ element, elements, printableParts, gizmoStep, selectedInstanceId }: printGizmoInstancePropsType) => {
  const product = useConfiguratorProduct((state) => state.product);
  const atlasSize = useMemo(() => resolvePrintAtlasSize(product), [product]);

  usePrintGizmoDrag({ element, elements, printableParts, atlasSize, gizmoStep, selectedInstanceId });

  return null;
});

PrintGizmoInstance.displayName = 'PrintGizmoInstance';

export { PrintGizmoInstance };
