'use client';

import { memo } from 'react';

import { AtomTabsList, AtomTabsSeparator, AtomTabsTrigger, SlidingIndicator, Text } from '@atoms';
import { useSlidingIndicator } from '@hooks';
import type { configuratorTabItemPropsType, configuratorTabsListPropsType } from '@types';
import { cn } from '@utils';

const ConfiguratorTabItem = memo(({ item, index, activeIndex, getItemRef }: configuratorTabItemPropsType) => {
  const isReached = index <= activeIndex;

  return (
    <>
      {index > 0 && <AtomTabsSeparator isActive={isReached} />}
      <span
        ref={(node) => {
          const trigger = node?.querySelector<HTMLElement>('[data-slot="tabs-trigger"]') ?? node;
          getItemRef(index)(trigger);
        }}
        className="inline-flex"
      >
        <AtomTabsTrigger value={item.value} disabled={item.disabled} data-progress-active={isReached || undefined}>
          <Text variant="menu_step_buy" data-active={isReached} asChild>
            <span>{item.label}</span>
          </Text>
        </AtomTabsTrigger>
      </span>
    </>
  );
});

ConfiguratorTabItem.displayName = 'ConfiguratorTabItem';

const ConfiguratorStepTabsList = ({ items, activeIndex, listClassName }: configuratorTabsListPropsType) => {
  const { wrapperRef, getItemRef, indicatorRef } = useSlidingIndicator(activeIndex);

  return (
    <div ref={wrapperRef} className="relative w-fit pt-2">
      <AtomTabsList className={cn('gap-3', listClassName)}>
        {items.map((item, index) => (
          <ConfiguratorTabItem key={item.value} item={item} index={index} activeIndex={activeIndex} getItemRef={getItemRef} />
        ))}
      </AtomTabsList>

      <SlidingIndicator ref={indicatorRef} variant="gradient" />
    </div>
  );
};

export { ConfiguratorStepTabsList };
