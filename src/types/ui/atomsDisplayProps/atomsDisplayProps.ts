import type { ComponentProps, CSSProperties, ImgHTMLAttributes, ReactNode } from 'react';

import type { atomImageVariantType, atomListVariantType, childrenType, slidingIndicatorTrackVariantType, slidingIndicatorVariantType } from '@types';

type svgIconNameType =
  | 'colori'
  | 'contorno'
  | 'close'
  | 'select_color'
  | 'share'
  | 'plus'
  | 'duplicate'
  | 'info'
  | 'cart'
  | 'ruler'
  | 'none'
  | 'delete'
  | 'upload'
  | 'edit'
  | 'question'
  | 'three_dots'
  | 'arrow_right';

interface svgIconPropsType {
  name: svgIconNameType;
  className?: string;
}

type atomImagePropsType = childrenType &
  ImgHTMLAttributes<HTMLImageElement> & {
    src: string;
    alt: string;
    variant?: atomImageVariantType;
    priority?: boolean;
    fit?: 'contain' | 'cover';
    className?: string;
    width?: number;
    height?: number;
    'data-active'?: boolean;
    style?: CSSProperties;
  };

interface atomListPropsType {
  variant?: atomListVariantType;
  items: ReactNode[];
  icon?: ReactNode;
  wrapperClassName?: string;
  itemClassName?: string;
  iconClassName?: string;
  contentClassName?: string;
}

type slidingIndicatorPropsType = ComponentProps<'span'> & {
  variant?: slidingIndicatorVariantType;
};

type slidingIndicatorTrackPropsType = ComponentProps<'span'> & {
  variant?: slidingIndicatorTrackVariantType;
};

interface scrollAreaPropsType {
  children: ReactNode;
  className?: string;
  fadeEdges?: boolean;
}

interface logoPropsType {
  href?: string;
}

export type {
  atomImagePropsType,
  atomListPropsType,
  logoPropsType,
  scrollAreaPropsType,
  slidingIndicatorPropsType,
  slidingIndicatorTrackPropsType,
  svgIconNameType,
  svgIconPropsType,
};
