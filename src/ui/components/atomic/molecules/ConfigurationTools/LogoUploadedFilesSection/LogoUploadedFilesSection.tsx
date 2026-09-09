'use client';

import { DefaultBrandLogoPlaceholder } from '@molecules/ConfigurationTools/DefaultBrandLogoPlaceholder';
import { LogoListRow } from '@molecules/ConfigurationTools/LogoListRow';
import type { logoUploadedFilesSectionPropsType } from '@types';
import { Flex, Grid, SvgIcon, Text } from '@atoms';
import { CONFIGURATOR_UPLOADED_FILES_LABEL } from '@constants';
const LogoUploadedFilesSection = ({ userLogos, onEdit, onDelete }: logoUploadedFilesSectionPropsType) => {
  return (
    <Flex variant="logo_uploaded_section">
      <Text variant="logo_uploaded_label">{CONFIGURATOR_UPLOADED_FILES_LABEL}</Text>
      <Grid variant="logo_info_panel">
        <SvgIcon name="info" className="max-xl:size-3.25" />
        <Text variant="logo_uploaded_hint">Trascina i loghi davanti, dietro o sulle maniche a seconda di dove li vorresti posizionati.</Text>
      </Grid>
      <Flex variant="logo_uploaded_list" asChild>
        <ul>
          <li className="w-full">
            <DefaultBrandLogoPlaceholder />
          </li>
          {userLogos.map((part) => (
            <li key={part.id} className="w-full" data-testid="logo-list-item" data-filename={part.fileName}>
              <LogoListRow part={part} onEdit={() => onEdit(part.id)} onDelete={() => onDelete(part.id)} />
            </li>
          ))}
        </ul>
      </Flex>
    </Flex>
  );
};

export { LogoUploadedFilesSection };
