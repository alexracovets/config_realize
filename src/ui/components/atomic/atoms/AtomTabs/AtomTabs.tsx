'use client';

import { createContext, forwardRef, useContext } from 'react';

import { cva } from 'class-variance-authority';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@shared';
import type {
  atomTabsContentPropsType,
  atomTabsListPropsType,
  atomTabsRootPropsType,
  atomTabsTriggerPropsType,
  atomTabsVariantType,
} from '@types';
import { cn } from '@utils';

const AtomTabsVariantContext = createContext<atomTabsVariantType>('default');

const useAtomTabsVariant = () => useContext(AtomTabsVariantContext);

type SharedTabsListVariant = 'default' | 'line';

const atomTabsRootVariants = cva('', {
  variants: {
    variant: {
      default: '',
      line: '',
      configurator: 'gap-0',
      modal: 'flex min-h-0 w-full flex-1 flex-col overflow-hidden gap-4',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

const atomTabsListVariants = cva('', {
  variants: {
    variant: {
      default: '',
      line: '',
      configurator: cn('inline-flex h-auto w-fit items-center rounded-none bg-transparent p-0', 'group-data-horizontal/tabs:h-auto'),
      modal: cn('inline-flex h-auto w-fit items-center rounded-none bg-transparent', 'group-data-horizontal/tabs:h-auto'),
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

const atomTabsTriggerVariants = cva('', {
  variants: {
    variant: {
      default: cn('text-default text-[14px] font-[500] flex items-center justify-center gap-2 bg-transparent', 'px-6.5 [&_svg]:size-5'),
      line: '',
      configurator: cn(
        'h-auto flex-none rounded-none border-transparent bg-transparent shadow-none',
        'hover:bg-transparent data-active:bg-transparent',
        'after:hidden',
        'focus-visible:ring-0 focus-visible:outline-none',
      ),
      modal: cn(
        'flex-none text-gray-30 text-[14px] font-[500] inline-flex items-center justify-center gap-2 bg-transparent',
        'px-6.5 pb-3 [&_svg]:size-5',
        'data-active:text-default transition-colors duration-200',
      ),
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

const atomTabsContentVariants = cva('', {
  variants: {
    variant: {
      default: '',
      line: '',
      configurator: 'pt-4',
      modal: 'flex-none min-h-0 pt-2 outline-none',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

const sharedTabsListVariantMap: Record<atomTabsVariantType, SharedTabsListVariant> = {
  default: 'default',
  line: 'line',
  configurator: 'line',
  modal: 'line',
};

const AtomTabsList = ({ className, variant: variantProp, ...props }: atomTabsListPropsType) => {
  const contextVariant = useAtomTabsVariant();
  const variant = variantProp ?? contextVariant;
  const sharedVariant = sharedTabsListVariantMap[variant ?? 'default'];

  return <TabsList variant={sharedVariant} className={cn(atomTabsListVariants({ variant }), className)} {...props} />;
};

const AtomTabsTrigger = forwardRef<HTMLButtonElement, atomTabsTriggerPropsType>(({ className, variant: variantProp, ...props }, ref) => {
  const contextVariant = useAtomTabsVariant();
  const variant = variantProp ?? contextVariant;

  return <TabsTrigger ref={ref} className={cn(atomTabsTriggerVariants({ variant }), className)} {...props} />;
});

AtomTabsTrigger.displayName = 'AtomTabsTrigger';

const AtomTabsContent = ({ className, variant: variantProp, ...props }: atomTabsContentPropsType) => {
  const contextVariant = useAtomTabsVariant();
  const variant = variantProp ?? contextVariant;

  return <TabsContent className={cn(atomTabsContentVariants({ variant }), className)} {...props} />;
};

const AtomTabs = ({
  className,
  variant = 'default',
  items,
  listClassName,
  contentClassName,
  hideList,
  hideContent,
  children,
  value,
  ...props
}: atomTabsRootPropsType) => {
  return (
    <AtomTabsVariantContext.Provider value={variant ?? 'default'}>
      <Tabs className={cn(atomTabsRootVariants({ variant }), className)} value={value} {...props}>
        {items ? (
          <>
            {!hideList && (
              <AtomTabsList className={listClassName}>
                {items.map(({ value: itemValue, label, disabled }) => (
                  <AtomTabsTrigger key={itemValue} value={itemValue} disabled={disabled}>
                    {label}
                  </AtomTabsTrigger>
                ))}
              </AtomTabsList>
            )}
            {!hideContent &&
              items.map(({ value: itemValue, content: Content }) => (
                <AtomTabsContent key={itemValue} value={itemValue} className={contentClassName}>
                  <Content />
                </AtomTabsContent>
              ))}
          </>
        ) : (
          children
        )}
      </Tabs>
    </AtomTabsVariantContext.Provider>
  );
};

export {
  AtomTabs,
  AtomTabsList,
  AtomTabsTrigger,
  AtomTabsContent,
  atomTabsRootVariants,
  atomTabsListVariants,
  atomTabsTriggerVariants,
  atomTabsContentVariants,
};
