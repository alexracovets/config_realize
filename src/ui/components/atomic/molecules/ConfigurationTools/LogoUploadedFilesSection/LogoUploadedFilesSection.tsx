'use client';

import { DefaultBrandLogoPlaceholder } from '@molecules/ConfigurationTools/DefaultBrandLogoPlaceholder';
import { LogoListRow } from '@molecules/ConfigurationTools/LogoListRow';
import type { logoUploadedFilesSectionPropsType } from '@types';
import { Flex, Text } from '@atoms';
import { CONFIGURATOR_UPLOADED_FILES_LABEL } from '@constants';
const LogoUploadedFilesSection = ({ userLogos, onEdit, onDelete }: logoUploadedFilesSectionPropsType) => {
  return (
    <Flex className="flex-col gap-3 items-start w-full">
      <Text className="text-[14px] leading-[15px] text-gray">{CONFIGURATOR_UPLOADED_FILES_LABEL}</Text>
      <Flex className="flex-col gap-5 items-start w-full" asChild>
        <ul>
          <li className="w-full">
            <DefaultBrandLogoPlaceholder />
          </li>
          {userLogos.map((part) => (
            <li key={part.id} className="w-full">
              <LogoListRow part={part} onEdit={() => onEdit(part.id)} onDelete={() => onDelete(part.id)} />
            </li>
          ))}
        </ul>
      </Flex>
    </Flex>
  );
};

export { LogoUploadedFilesSection };
