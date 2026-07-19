import type { printPositionConflictsConfigType, textDefaultsConfigType, textPositionConfigType, uvPointType } from '@types';

interface mappedGizmoFlagsType {
  showFrame: boolean;
  showGizmo: boolean;
  interactive: boolean;
}

type textPrintPositionType = {
  key: string;
  positionId?: string;
  conflicts?: printPositionConflictsConfigType;
  partId: string;
  uv: uvPointType;
} & Pick<textPositionConfigType, 'label' | 'rotation' | 'fontSize' | 'src' | 'heightMinCm' | 'heightMaxCm' | 'widthMinCm' | 'widthMaxCm'> &
  mappedGizmoFlagsType;

type textPrintInstanceType = {
  id: string;
  positionKey: string;
  /** Position default orientation; affects text only, not gizmo. */
  placementRotation?: number;
} & Pick<textDefaultsConfigType, 'text' | 'font' | 'textColor' | 'strokeColor' | 'strokeWidth'> &
  Pick<textPrintPositionType, 'label' | 'partId' | 'uv' | 'rotation' | 'fontSize' | 'showFrame' | 'showGizmo'>;

type textPrintPreviewType<T extends textPrintInstanceType = textPrintInstanceType> = {
  instanceId: string;
  patch: Partial<Pick<T, 'text' | 'textColor' | 'strokeColor' | 'fontSize' | 'strokeWidth'>>;
};

interface textPrintLimitsType {
  maxLength: number;
  heightMin: number;
  heightMax: number;
  widthMin: number;
  widthMax: number;
  strokeWidthMax: number;
}

type namePositionType = textPrintPositionType;
type nameInstanceType = textPrintInstanceType;
type namePreviewType = textPrintPreviewType<nameInstanceType>;
type nameLimitsType = textPrintLimitsType;

type numberPositionType = textPrintPositionType & { lineHeight?: number };
type numberInstanceType = textPrintInstanceType & { lineHeight: number };
type numberPreviewType = {
  instanceId: string;
  patch: Partial<Pick<numberInstanceType, 'text' | 'textColor' | 'strokeColor' | 'fontSize' | 'strokeWidth' | 'lineHeight'>>;
};
type numberLimitsType = textPrintLimitsType & { lineHeightMin: number; lineHeightMax: number };

type testoPositionType = textPrintPositionType & { lineHeight?: number; letterSpacing?: number };
type testoInstanceType = textPrintInstanceType & { lineHeight: number; letterSpacing: number };
type testoPreviewType = {
  instanceId: string;
  patch: Partial<Pick<testoInstanceType, 'text' | 'textColor' | 'strokeColor' | 'fontSize' | 'strokeWidth' | 'lineHeight' | 'letterSpacing'>>;
};
type testoLimitsType = textPrintLimitsType & {
  lineHeightMin: number;
  lineHeightMax: number;
  letterSpacingMin: number;
  letterSpacingMax: number;
};

type garmentTextRenderInstanceType = nameInstanceType | numberInstanceType | testoInstanceType;

export type {
  garmentTextRenderInstanceType,
  mappedGizmoFlagsType,
  nameInstanceType,
  nameLimitsType,
  namePositionType,
  namePreviewType,
  numberInstanceType,
  numberLimitsType,
  numberPositionType,
  numberPreviewType,
  testoInstanceType,
  testoLimitsType,
  testoPositionType,
  testoPreviewType,
};
