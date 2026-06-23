import type { nameLimitsType, numberLimitsType, testoLimitsType } from '@types';

interface namePartFormPropsType {
  instanceId: string;
  limits: nameLimitsType;
  placeholder: string;
}

interface numberPartFormPropsType {
  instanceId: string;
  limits: numberLimitsType;
  placeholder: string;
  lineHeightShow: boolean;
}

interface testoPartFormPropsType {
  instanceId: string;
  limits: testoLimitsType;
  placeholder: string;
  lineHeightShow: boolean;
  letterSpacingShow: boolean;
}

interface partColorControlPropsType {
  partId: string;
}

interface configurationPositionPickerPositionType {
  key: string;
  label: string;
  interactive: boolean;
}

interface configurationPositionPickerInstanceType {
  id: string;
  positionKey: string;
}

type filePickContextUploadType = { mode: 'upload' };
type filePickContextReplaceType = { mode: 'replace'; partId: string };
type filePickContextType = filePickContextUploadType | filePickContextReplaceType;

export type {
  configurationPositionPickerInstanceType,
  configurationPositionPickerPositionType,
  filePickContextType,
  namePartFormPropsType,
  numberPartFormPropsType,
  testoPartFormPropsType,
  partColorControlPropsType,
};
