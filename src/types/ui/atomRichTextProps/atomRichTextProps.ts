import type { CSSProperties } from 'react';

import type { textVariantType } from '@types';

interface atomRichTextTextPropsType {
  content: string;
  className?: string;
  variant?: textVariantType;
  style?: CSSProperties;
}

type atomRichTextPropsType = atomRichTextTextPropsType;

export type { atomRichTextPropsType, atomRichTextTextPropsType };
