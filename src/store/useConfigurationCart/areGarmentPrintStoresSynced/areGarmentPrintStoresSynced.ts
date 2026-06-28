'use client';

import { useGarmentDesign } from '@store/useGarmentDesign';
import { useGarmentLogo } from '@store/useGarmentLogo';
import { useGarmentName } from '@store/useGarmentName';
import { useGarmentNumber } from '@store/useGarmentNumber';
import { useGarmentTesto } from '@store/useGarmentTesto';
const areGarmentPrintStoresSynced = (expectedProductPath: string) => {
  const productPaths = [
    useGarmentDesign.getState().productPath,
    useGarmentName.getState().productPath,
    useGarmentNumber.getState().productPath,
    useGarmentTesto.getState().productPath,
    useGarmentLogo.getState().productPath,
  ];

  return productPaths.every((productPath) => productPath === expectedProductPath);
};

export { areGarmentPrintStoresSynced };
