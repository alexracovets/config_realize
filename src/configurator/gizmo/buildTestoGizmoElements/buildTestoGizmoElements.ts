import type { buildTestoGizmoElementsInputType, printGizmoElementType } from '@configurator/types';
import { buildLineHeightTextGizmoElements } from '@configurator/gizmo';
const buildTestoGizmoElements = ({ product, instances, resolveFontSizeLimits }: buildTestoGizmoElementsInputType): printGizmoElementType[] =>
  buildLineHeightTextGizmoElements({ kind: 'testo', product, instances, resolveFontSizeLimits });

export { buildTestoGizmoElements };
