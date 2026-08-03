'use client';

import { DefaultBrandLogoPlaceholder } from '@molecules/ConfigurationTools/DefaultBrandLogoPlaceholder';
import { LogoListRow } from '@molecules/ConfigurationTools/LogoListRow';
import type { logoUploadedFilesSectionPropsType } from '@types';
import { Flex, Grid, SvgIcon, Text } from '@atoms';
import { CONFIGURATOR_UPLOADED_FILES_LABEL } from '@constants';
const LogoUploadedFilesSection = ({ userLogos, onEdit, onDelete }: logoUploadedFilesSectionPropsType) => {
  return (
    <Flex className="flex-col gap-3 max-xl:gap-2.5 items-start w-full">
      <Text className="text-[14px] leading-[15px] max-xl:text-[11px] max-xl:leading-3 text-gray">{CONFIGURATOR_UPLOADED_FILES_LABEL}</Text>
      <Grid className="grid-cols-[auto_1fr] gap-2.5 max-xl:gap-2 items-center px-3 max-xl:px-2.5 p-2 max-xl:py-1.5 rounded-[4px] bg-primary w-full">
        <SvgIcon name="info" className="max-xl:size-3.25" />
        <Text className="text-[12px] max-xl:text-[10px] text-gray">
          Trascina i loghi davanti, dietro o sulle maniche a seconda di dove li vorresti posizionati.
        </Text>
      </Grid>
      <Flex className="flex-col gap-5 max-xl:gap-4 items-start w-full" asChild>
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
