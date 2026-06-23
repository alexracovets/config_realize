'use client';

import { cva } from 'class-variance-authority';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@shared';
import type { accordionAtomPropsType } from '@types';
import { cn } from '@utils';

const accordionItemVariants = cva('', {
  variants: {
    variant: {
      default: 'border-b border-border',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

const accordionTriggerVariants = cva('', {
  variants: {
    variant: {
      default: cn('py-3 color-gray-30', 'transition-colors duration-150 ease-out'),
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

const accordionContentVariants = cva('', {
  variants: {
    variant: {
      default: '',
      bordered: '',
      ghost: 'px-2',
      filled: 'text-muted-foreground',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

const AccordionAtom = ({ items, variant = 'default', className, defaultValue, value, onValueChange, multiple = false }: accordionAtomPropsType) => {
  return (
    <Accordion className={cn(className)} multiple={multiple} defaultValue={defaultValue} value={value} onValueChange={onValueChange}>
      {items.map(({ value, trigger, content }) => (
        <AccordionItem key={value} value={value} className={accordionItemVariants({ variant })}>
          <AccordionTrigger className={cn(accordionTriggerVariants({ variant }))}>{trigger}</AccordionTrigger>
          <AccordionContent className={accordionContentVariants({ variant })}>{content}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

export { AccordionAtom };
