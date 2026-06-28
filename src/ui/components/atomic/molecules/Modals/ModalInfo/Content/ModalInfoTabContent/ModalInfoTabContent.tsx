'use client';

import type { modalInfoTabContentPropsType } from '@types';
import { AtomTabsContent, Flex, Text } from '@atoms';
import { ModalInfoSectionParts } from '@molecules/Modals/ModalInfo/Content/ModalInfoTabContent/ModalInfoSectionParts';
const ModalInfoTabContent = ({ tab, tabValue }: modalInfoTabContentPropsType) => {
  return (
    <AtomTabsContent value={tabValue}>
      {tab.title ? (
        <Text variant="h2" asChild>
          <h2>{tab.title}</h2>
        </Text>
      ) : null}
      <Flex className="w-full flex-col gap-6">
        {tab.sections.map((section) => (
          <Flex key={section.id} variant="info_part">
            {section.heading ? (
              <Text variant="h3" className={section.headingClassName} asChild>
                <h3>{section.heading}</h3>
              </Text>
            ) : null}
            <ModalInfoSectionParts parts={section.parts} />
          </Flex>
        ))}
      </Flex>
    </AtomTabsContent>
  );
};

export { ModalInfoTabContent };
