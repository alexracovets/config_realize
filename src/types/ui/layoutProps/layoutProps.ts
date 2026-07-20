import type { CSSProperties, Ref } from 'react';

import type { boxVariantType, childrenType, flexVariantType, gridVariantType, textVariantType } from '@types';

type boxPropsType = childrenType & {
  variant?: boxVariantType;
  style?: CSSProperties;
  className?: string;
  onClick?: () => void;
  asChild?: boolean;
};

type flexPropsType = childrenType & {
  variant?: flexVariantType;
  style?: CSSProperties;
  className?: string;
  asChild?: boolean;
};

type gridPropsType = childrenType & {
  variant?: gridVariantType;
  style?: CSSProperties;
  className?: string;
  asChild?: boolean;
};

type containerPropsType = childrenType & {
  className?: string;
};

type textPropsType = childrenType & {
  variant?: textVariantType;
  style?: CSSProperties;
  className?: string;
  asChild?: boolean;
  ref?: Ref<HTMLElement>;
};

type defaultPagesTemplatePropsType = childrenType & {
  noFooter?: boolean;
};

type shopRouteHandleType = {
  noFooter?: boolean;
};

export type { boxPropsType, containerPropsType, defaultPagesTemplatePropsType, flexPropsType, gridPropsType, shopRouteHandleType, textPropsType };
