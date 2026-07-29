'use client';

import { Accordion as AccordionPrimitive } from '@base-ui/react/accordion';

import { ChevronDownIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '@utils';

const Accordion = ({ className, ...props }: AccordionPrimitive.Root.Props) => {
  return <AccordionPrimitive.Root data-slot="accordion" className={cn('flex w-full flex-col', className)} {...props} />;
};

const AccordionItem = ({ className, ...props }: AccordionPrimitive.Item.Props) => {
  return <AccordionPrimitive.Item data-slot="accordion-item" className={cn('group/accordion-item', className)} {...props} />;
};

type accordionTriggerPropsType = AccordionPrimitive.Trigger.Props & {
  actions?: ReactNode;
};

const AccordionTrigger = ({ className, children, actions, ...props }: accordionTriggerPropsType) => {
  return (
    <AccordionPrimitive.Header className="flex items-center gap-2">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          'peer/accordion-trigger group/accordion-trigger flex min-w-0 flex-1 items-center cursor-pointer outline-none',
          'rounded-lg border border-transparent',
          'aria-disabled:pointer-events-none aria-disabled:opacity-50',
          'outline-none transition-colors',
          className,
        )}
        {...props}
      >
        {children}
      </AccordionPrimitive.Trigger>
      {actions}
      <ChevronDownIcon
        data-slot="accordion-trigger-icon"
        aria-hidden
        className="mr-[8px] size-4 shrink-0 text-base-black transition-transform duration-150 ease-out peer-aria-expanded/accordion-trigger:rotate-180 max-xl:mr-1.5 max-xl:size-3.25 max-sm:mr-0 max-sm:size-3"
      />
    </AccordionPrimitive.Header>
  );
};

const AccordionContent = ({ className, children, onClick, ...props }: AccordionPrimitive.Panel.Props) => {
  return (
    <AccordionPrimitive.Panel
      data-slot="accordion-content"
      className={cn(
        'h-(--accordion-panel-height) overflow-hidden',
        'transition-[height] duration-150 ease-out',
        'data-starting-style:h-0 data-ending-style:h-0',
      )}
      {...props}
    >
      <div className={cn('p-1', className)} onClick={onClick}>
        {children}
      </div>
    </AccordionPrimitive.Panel>
  );
};

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger };
