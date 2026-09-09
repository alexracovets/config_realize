'use client';

import type { ReactNode } from 'react';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@shared';
import { cn } from '@utils';

type AtomTooltipProps = {
  content?: ReactNode;
  children: ReactNode;
  className?: string;
  side?: 'top' | 'bottom' | 'left' | 'right' | 'inline-start' | 'inline-end';
};

const AtomTooltip = ({ content, children, className, side = 'top' }: AtomTooltipProps) => {
  if (content == null || content === false || content === '') {
    return children;
  }

  return (
    <Tooltip>
      <TooltipTrigger render={<span className={cn('inline-flex', className)} />}>{children}</TooltipTrigger>
      <TooltipContent side={side}>{content}</TooltipContent>
    </Tooltip>
  );
};

const AtomTooltipProvider = TooltipProvider;
const AtomTooltipTrigger = TooltipTrigger;
const AtomTooltipContent = TooltipContent;

export { AtomTooltip, AtomTooltipContent, AtomTooltipProvider, AtomTooltipTrigger };
export type { AtomTooltipProps };
