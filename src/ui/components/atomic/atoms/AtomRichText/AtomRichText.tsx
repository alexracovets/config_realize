'use client';

import type { atomRichTextTextPropsType } from '@types';

import { cn } from '@utils';

import { Text } from '@atoms';

const AtomRichText = ({ content, className, variant = 'default', ...props }: atomRichTextTextPropsType) => {
  return (
    <Text variant={variant} className={cn('leading-[1.4] text-left w-full', className)} {...props}>
      <span dangerouslySetInnerHTML={{ __html: content }} className="text-left" />
    </Text>
  );
};

export { AtomRichText };
