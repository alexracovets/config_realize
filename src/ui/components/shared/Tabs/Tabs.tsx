'use client';

import { forwardRef } from 'react';

import { Tabs as TabsPrimitive } from '@base-ui/react/tabs';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@utils';

function Tabs({ className, orientation = 'horizontal', ...props }: TabsPrimitive.Root.Props) {
  return (
    <TabsPrimitive.Root data-slot="tabs" data-orientation={orientation} className={cn('group/tabs flex data-horizontal:flex-col', className)} {...props} />
  );
}

const tabsListVariants = cva(
  'group/tabs-list inline-flex w-fit items-center justify-center rounded-lg text-muted-foreground group-data-vertical/tabs:flex-col data-[variant=line]:rounded-none',
  {
    variants: {
      variant: {
        default: 'bg-muted',
        line: 'bg-transparent',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

function TabsList({ className, variant = 'default', ...props }: TabsPrimitive.List.Props & VariantProps<typeof tabsListVariants>) {
  return <TabsPrimitive.List data-slot="tabs-list" data-variant={variant} className={cn(tabsListVariants({ variant }), className)} {...props} />;
}

const TabsTrigger = forwardRef<HTMLButtonElement, TabsPrimitive.Tab.Props>(({ className, ...props }, ref) => {
  return (
    <TabsPrimitive.Tab
      ref={ref}
      data-slot="tabs-trigger"
      className={cn('relative cursor-pointer inline-flex flex-1 items-center justify-center whitespace-nowrap font-inter', className)}
      {...props}
    />
  );
});

TabsTrigger.displayName = 'TabsTrigger';

function TabsContent({ className, ...props }: TabsPrimitive.Panel.Props) {
  return <TabsPrimitive.Panel data-slot="tabs-content" className={cn('flex-1 text-sm outline-none', className)} {...props} />;
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants };
