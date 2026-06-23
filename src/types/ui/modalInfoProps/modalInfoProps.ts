import type { ReactNode } from 'react';

import type { modalInfoPartType, modalInfoTablePartType, modalInfoTabType } from '@types';

type modalInfoTabConfigType = {
  value: string;
  label: string;
  icon: ReactNode;
  tab: modalInfoTabType;
};

type modalInfoTabContentPropsType = {
  tab: modalInfoTabType;
  tabValue: string;
};

type modalInfoSectionPartsPropsType = {
  parts: modalInfoPartType[];
};

type modalInfoTablePropsType = {
  part: modalInfoTablePartType;
};

export type { modalInfoSectionPartsPropsType, modalInfoTabConfigType, modalInfoTabContentPropsType, modalInfoTablePropsType };
