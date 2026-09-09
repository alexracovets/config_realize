'use client';

import { ModalInfoListIcon } from '@molecules/Modals/ModalInfo/Content/ModalInfoTabContent/ModalInfoListIcon';
import { ModalInfoTable } from '@molecules/Modals/ModalInfo/Content/ModalInfoTabContent/ModalInfoTable';
import type { modalInfoSectionPartsPropsType } from '@types';
import { AtomImage, AtomList, AtomRichText, Box, Flex } from '@atoms';
import { withListPunctuation } from '@utils';
const ModalInfoSectionParts = ({ parts }: modalInfoSectionPartsPropsType) => {
  return (
    <Flex variant="modal_info_parts_column">
      {parts.map((part, index) => {
        switch (part.type) {
          case 'text':
            return (
              <Flex key={index} variant="modal_info_text_part">
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
              <Box key={index} variant="info_image_wrapper">
                <AtomImage
                  src={part.src}
                  alt={part.alt ?? ''}
                  width={400}
                  height={600}
                  sizes="(max-width: 400px) 100vw, 400px"
                  className="h-auto w-full"
                  style={{ width: '100%', height: 'auto' }}
                />
              </Box>
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
