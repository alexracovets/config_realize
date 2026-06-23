'use client';

import { useState } from 'react';

import { AtomDialog, AtomDialogContent, AtomDialogTitle, AtomTabs, AtomTabsTrigger, ScrollArea } from '@atoms';
import { AtomTabsSlidingList } from '../../AtomTabsSlidingList';

import { ModalInfoTabContent } from './Content';
import { MODAL_INFO_TABS } from './modalInfoTabs';

import { useInfoDialog } from '@store';

const ModalInfo = () => {
  const isOpen = useInfoDialog((state) => state.isOpen);
  const setIsOpen = useInfoDialog((state) => state.setIsOpen);
  const [activeTab, setActiveTab] = useState(MODAL_INFO_TABS[0]?.value ?? 'faq');

  return (
    <AtomDialog open={isOpen} onOpenChange={setIsOpen}>
      <AtomDialogContent aria-describedby={undefined} aria-label="Informazioni">
        <AtomDialogTitle visuallyHidden>Info Dialog</AtomDialogTitle>
        <AtomTabs variant="modal" value={activeTab} onValueChange={(value) => value && setActiveTab(value)}>
          <AtomTabsSlidingList activeValue={activeTab} preset="modal" className="shrink-0">
            {MODAL_INFO_TABS.map(({ value, label, icon }) => (
              <AtomTabsTrigger key={value} value={value}>
                {icon}
                {label}
              </AtomTabsTrigger>
            ))}
          </AtomTabsSlidingList>
          <ScrollArea className="min-h-0 flex-1 w-full" fadeEdges>
            {MODAL_INFO_TABS.map(({ value, tab }) => (
              <ModalInfoTabContent key={value} tab={tab} tabValue={value} />
            ))}
          </ScrollArea>
        </AtomTabs>
      </AtomDialogContent>
    </AtomDialog>
  );
};

export { ModalInfo };
