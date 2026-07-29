'use client';

import { cva } from 'class-variance-authority';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@shared';
import { Button, SvgIcon } from '@atoms';
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
      default: cn('py-3 color-gray-30', 'max-xl:py-2.5', 'max-sm:py-2', 'transition-colors duration-150 ease-out'),
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

const AccordionDeleteAction = ({ onDelete }: { onDelete: () => void }) => (
  <Button
    type="button"
    variant="delete"
    size="delete"
    className="shrink-0"
    aria-label="Eliminare"
    onPointerDown={(event) => event.stopPropagation()}
    onClick={(event) => {
      event.stopPropagation();
      onDelete();
    }}
  >
    <SvgIcon name="delete" className="w-[14px] h-[15.75px] max-xl:w-2.75 max-xl:h-[12.5px]" />
  </Button>
);

const AccordionAtom = ({
  items,
  variant = 'default',
  className,
  defaultValue,
  value,
  onValueChange,
  onItemActivate,
  multiple = false,
}: accordionAtomPropsType) => {
  return (
    <Accordion className={cn(className)} multiple={multiple} defaultValue={defaultValue} value={value} onValueChange={onValueChange}>
      {items.map(({ value: itemValue, trigger, content, onDelete }) => {
        const activateItem = () => onItemActivate?.(itemValue);

        return (
          <AccordionItem key={itemValue} value={itemValue} className={accordionItemVariants({ variant })}>
            <AccordionTrigger
              className={cn(accordionTriggerVariants({ variant }))}
              onClick={activateItem}
              actions={onDelete ? <AccordionDeleteAction onDelete={onDelete} /> : undefined}
            >
              {trigger}
            </AccordionTrigger>
            <AccordionContent className={accordionContentVariants({ variant })} onClick={activateItem}>
              {content}
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
};

export { AccordionAtom };
