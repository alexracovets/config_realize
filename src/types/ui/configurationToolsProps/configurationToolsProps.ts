import type { stepLogoPartStateType } from '@types';
import type { ChangeEvent } from 'react';
interface colorControlPropsType {
  color: string;
  label?: string;
  onSelect?: (color: string) => void;
  onPreviewSelect?: (color: string) => void;
}

type colorTabType = 'colori' | 'contorno';

type colorTabVariantType = 'design' | 'text';

interface colorTabControlPropsType {
  textColor: string;
  strokeColor: string;
  onTextColor: (color: string) => void;
  onStrokeColor: (color: string) => void;
  onPreviewTextColor?: (color: string) => void;
  onPreviewStrokeColor?: (color: string) => void;
  label?: string;
  tabVariant?: colorTabVariantType;
}

interface fontSelectRowPropsType {
  font: string;
  onChange: (font: string) => void;
}

interface hiddenLogoFileInputPropsType {
  disabled?: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

interface logoEditPanelPropsType {
  partId: string;
  onClose: () => void;
  onReplaceImage: () => void;
  replacing?: boolean;
}

interface logoListRowPropsType {
  part: stepLogoPartStateType;
  onEdit?: () => void;
  onDelete?: () => void;
}

interface logoUploadedFilesSectionPropsType {
  userLogos: stepLogoPartStateType[];
  onEdit: (partId: string) => void;
  onDelete: (partId: string) => void;
}

interface partColorSwitchPropsType {
  color: string;
  label: string;
  statusLabel?: string;
}

interface rangeControlPropsType {
  label?: string;
  value: number;
  onChange: (value: number) => void;
  onCommit?: (value: number) => void;
  min?: number;
  max?: number;
  unit?: string;
  /** Overrides the `{value}{unit}` label rendering — used to display slider values converted to another unit (e.g. cm). */
  formatValue?: (value: number) => string;
}

interface shadingControlPropsType {
  partId: string;
}

interface toggleControlPropsType {
  label: string;
  active: boolean;
  onChange: (value: boolean) => void;
}

interface configurationPositionOptionType {
  key: string;
  label: string;
  src?: string;
  disabled?: boolean;
}

interface configurationPositionSelectPropsType {
  label: string;
  title?: string;
  description?: string;
  positions: configurationPositionOptionType[];
  onSelect: (positionKey: string) => void;
  placeholder?: string;
}

interface configurationPositionPickerModalPropsType {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  positions: configurationPositionOptionType[];
  onSelect: (positionKey: string) => void;
}

export type {
  colorControlPropsType,
  colorTabType,
  colorTabVariantType,
  colorTabControlPropsType,
  configurationPositionOptionType,
  configurationPositionPickerModalPropsType,
  configurationPositionSelectPropsType,
  fontSelectRowPropsType,
  hiddenLogoFileInputPropsType,
  logoEditPanelPropsType,
  logoListRowPropsType,
  logoUploadedFilesSectionPropsType,
  partColorSwitchPropsType,
  rangeControlPropsType,
  shadingControlPropsType,
  toggleControlPropsType,
};
