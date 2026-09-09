import type { CSSProperties, HTMLAttributes, Ref } from 'react';

import type { boxVariantType, childrenType, flexVariantType, gridVariantType, textVariantType } from '@types';

type boxPropsType = Omit<HTMLAttributes<HTMLDivElement>, 'children'> &
  childrenType & {
    variant?: boxVariantType;
    style?: CSSProperties;
    className?: string;
    asChild?: boolean;
  };

type flexPropsType = Omit<HTMLAttributes<HTMLDivElement>, 'children'> &
  childrenType & {
    variant?: flexVariantType;
    style?: CSSProperties;
    className?: string;
    asChild?: boolean;
  };

type gridPropsType = Omit<HTMLAttributes<HTMLDivElement>, 'children'> &
  childrenType & {
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
