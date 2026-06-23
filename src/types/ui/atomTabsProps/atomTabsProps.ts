import type { ComponentProps } from 'react';

import type { Tabs, TabsContent, TabsList, TabsTrigger } from '@shared';

import type { atomTabsVariantType, headerConfigItemType } from '@types';

type atomTabsListPropsType = ComponentProps<typeof TabsList> & {
  variant?: atomTabsVariantType;
};

type atomTabsTriggerPropsType = ComponentProps<typeof TabsTrigger> & {
  variant?: atomTabsVariantType;
};

type atomTabsContentPropsType = ComponentProps<typeof TabsContent> & {
  variant?: atomTabsVariantType;
};

interface configuratorTabsListPropsType {
  items: headerConfigItemType[];
  activeIndex: number;
  listClassName?: string;
}

interface configuratorTabItemPropsType {
  item: headerConfigItemType;
  index: number;
  activeIndex: number;
  getItemRef: (index: number) => (el: HTMLElement | null) => void;
}

type atomTabsRootPropsType = ComponentProps<typeof Tabs> & {
  variant?: atomTabsVariantType;
  items?: headerConfigItemType[];
  listClassName?: string;
  contentClassName?: string;
  hideList?: boolean;
  hideContent?: boolean;
};

export type {
  atomTabsContentPropsType,
  atomTabsListPropsType,
  atomTabsRootPropsType,
  atomTabsTriggerPropsType,
  configuratorTabItemPropsType,
  configuratorTabsListPropsType,
};
