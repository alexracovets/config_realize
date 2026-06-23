import type { ComponentProps, ReactElement } from 'react';

import type { accordionAtomItemType } from '@types';

type accordionAtomVariantType = 'default';

interface accordionAtomPropsType {
  variant?: accordionAtomVariantType;
  items: accordionAtomItemType[];
  className?: string;
  defaultValue?: string[];
  value?: string[];
  onValueChange?: (value: string[]) => void;
  multiple?: boolean;
}

interface colorPickerPropsType {
  color: string;
  onChange: (color: string) => void;
  onPreviewChange?: (color: string) => void;
  trigger: ReactElement;
}

interface atomInputHexPropsType {
  value: string;
  onChange: (color: string) => void;
}

type searchInputVariantType = 'default';

type searchInputPropsType = ComponentProps<'input'> & {
  className?: string;
  variant?: searchInputVariantType;
};

export type { accordionAtomPropsType, atomInputHexPropsType, colorPickerPropsType, searchInputPropsType };
