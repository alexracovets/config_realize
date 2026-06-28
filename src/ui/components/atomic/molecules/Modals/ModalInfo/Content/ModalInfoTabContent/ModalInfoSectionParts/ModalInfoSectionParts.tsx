'use client';

import { ModalInfoListIcon } from '@molecules/Modals/ModalInfo/Content/ModalInfoTabContent/ModalInfoListIcon';
import { ModalInfoTable } from '@molecules/Modals/ModalInfo/Content/ModalInfoTabContent/ModalInfoTable';
import type { modalInfoSectionPartsPropsType } from '@types';
import { AtomImage, AtomList, AtomRichText, Flex } from '@atoms';
import { cn, withListPunctuation } from '@utils';
const ModalInfoSectionParts = ({ parts }: modalInfoSectionPartsPropsType) => {
  return (
    <Flex className="w-full flex-col items-stretch gap-4">
      {parts.map((part, index) => {
        switch (part.type) {
          case 'text':
            return (
              <Flex key={index} className={cn('w-full flex-col', part.compact ? 'gap-0' : 'gap-1')}>
                {part.content.map((item, itemIndex) => (
                  <AtomRichText key={itemIndex} content={item} />
                ))}
              </Flex>
            );
          case 'list':
            return (
              <AtomList
                key={index}
                variant="faq"
                wrapperClassName={part.compact ? 'gap-0' : undefined}
                icon={part.icon ? <ModalInfoListIcon icon={part.icon} /> : <ModalInfoListIcon icon="faq" />}
                items={part.items.map((item, itemIndex) => {
                  const isLast = itemIndex === part.items.length - 1;
                  const content = part.punctuate ? withListPunctuation(item, isLast) : item;

                  return <AtomRichText key={itemIndex} content={content} />;
                })}
              />
            );
          case 'image':
            return (
              <div key={index} className="mx-auto w-full max-w-[640px]">
                <AtomImage
                  src={part.src}
                  alt={part.alt ?? ''}
                  width={1024}
                  height={1024}
                  sizes="(max-width: 640px) 100vw, 640px"
                  className="h-auto w-full"
                  style={{ width: '100%', height: 'auto' }}
                />
              </div>
            );
          case 'table':
            return <ModalInfoTable key={index} part={part} />;
          default:
            return null;
        }
      })}
    </Flex>
  );
};

export { ModalInfoSectionParts };
