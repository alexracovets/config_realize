'use client';

import type { atomRichTextTextPropsType } from '@types';

import { cn } from '@utils';

import { Text } from '@atoms';

const AtomRichText = ({ content, className, variant = 'default', ...props }: atomRichTextTextPropsType) => {
  const resolvedVariant = variant === 'default' ? 'rich_text' : variant;

  return (
    <Text variant={resolvedVariant} {...props}>
      <span dangerouslySetInnerHTML={{ __html: content }} className={cn('text-left', className)} />
    </Text>
  );
};

export { AtomRichText };
