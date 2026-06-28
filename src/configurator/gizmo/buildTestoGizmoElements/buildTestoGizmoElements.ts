import type { buildTestoGizmoElementsInputType, printGizmoElementType } from '@configurator/types';
import { buildLineHeightTextGizmoElements } from '@configurator/gizmo';
const buildTestoGizmoElements = ({ product, instances, fontSizeMin, fontSizeMax }: buildTestoGizmoElementsInputType): printGizmoElementType[] =>
  buildLineHeightTextGizmoElements({ kind: 'testo', product, instances, fontSizeMin, fontSizeMax });

export { buildTestoGizmoElements };
