import type { logoPositionConfigType, mappedGizmoFlagsType } from '@types';

type logoPositionType = {
  key: string;
  partId: string;
  isDefault: boolean;
} & Pick<logoPositionConfigType, 'label' | 'uv' | 'rotation' | 'scale' | 'src'> &
  mappedGizmoFlagsType;

type logoInstanceType = {
  id: string;
  positionKey: string;
  src: string;
  fileName: string;
  naturalWidth: number;
  naturalHeight: number;
  /** Baked upload orientation correction; does not affect gizmo rotation. */
  uploadRotation: number;
  opacity: number;
} & Pick<logoPositionType, 'label' | 'partId' | 'uv' | 'rotation' | 'scale' | 'isDefault' | 'showFrame' | 'showGizmo'>;

interface logoPreviewType {
  instanceId: string;
  patch: Partial<Pick<logoInstanceType, 'scale' | 'rotation' | 'uv'>>;
}

type stepLogoPartStateType = Pick<
  logoInstanceType,
  'id' | 'positionKey' | 'label' | 'uv' | 'rotation' | 'opacity' | 'scale' | 'src' | 'fileName' | 'isDefault'
> & {
  baseScale: number;
  visible: boolean;
};

type stepLogoPositionStateType = Pick<logoPositionType, 'key' | 'label' | 'uv' | 'rotation' | 'scale' | 'interactive'> & {
  default: boolean;
  defaultSrc: string;
};

interface stepLogoStoreViewType {
  parts: stepLogoPartStateType[];
  positions: stepLogoPositionStateType[];
  canAddUserLogo: () => boolean;
  removePart: (id: string) => void;
  updatePart: (id: string, patch: Partial<stepLogoPartStateType>) => void;
}

export type { logoInstanceType, logoPositionType, logoPreviewType, stepLogoPartStateType, stepLogoPositionStateType, stepLogoStoreViewType };
