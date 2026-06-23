'use client';

import { useGarmentDesign } from '../useGarmentDesign';
import { useGarmentLogo } from '../useGarmentLogo';
import { useGarmentName } from '../useGarmentName';
import { useGarmentNumber } from '../useGarmentNumber';
import { useGarmentTesto } from '../useGarmentTesto';

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
