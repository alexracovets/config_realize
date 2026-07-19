import type { buildNumberGizmoElementsInputType, printGizmoElementType } from '@configurator/types';
import { buildLineHeightTextGizmoElements } from '@configurator/gizmo';
const buildNumberGizmoElements = ({ product, instances, resolveFontSizeLimits }: buildNumberGizmoElementsInputType): printGizmoElementType[] =>
  buildLineHeightTextGizmoElements({ kind: 'number', product, instances, resolveFontSizeLimits });

export { buildNumberGizmoElements };
