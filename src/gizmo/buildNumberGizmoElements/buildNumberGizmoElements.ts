import type { buildNumberGizmoElementsInputType, printGizmoElementType } from '@types';

import { buildLineHeightTextGizmoElements } from '../buildLineHeightTextGizmoElements';

const buildNumberGizmoElements = ({ product, instances, fontSizeMin, fontSizeMax }: buildNumberGizmoElementsInputType): printGizmoElementType[] =>
  buildLineHeightTextGizmoElements({ kind: 'number', product, instances, fontSizeMin, fontSizeMax });

export { buildNumberGizmoElements };
