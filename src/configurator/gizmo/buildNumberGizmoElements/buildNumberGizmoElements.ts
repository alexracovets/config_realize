import type { buildNumberGizmoElementsInputType, printGizmoElementType } from '@configurator/types';
import { buildLineHeightTextGizmoElements } from '@configurator/gizmo';
const buildNumberGizmoElements = ({ product, instances, fontSizeMin, fontSizeMax }: buildNumberGizmoElementsInputType): printGizmoElementType[] =>
  buildLineHeightTextGizmoElements({ kind: 'number', product, instances, fontSizeMin, fontSizeMax });

export { buildNumberGizmoElements };
