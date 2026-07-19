'use client';

import { usePrintCmScale } from '@hooks/usePrintCmScale';
import { createPrintUnit, type printUnitType } from '@utils';
import { useMemo } from 'react';

interface printUnitsType {
  x: printUnitType;
  y: printUnitType;
}

const usePrintUnits = (): printUnitsType => {
  const cmScale = usePrintCmScale();

  return useMemo(() => ({ x: createPrintUnit(cmScale?.cmPerPxHorizontal), y: createPrintUnit(cmScale?.cmPerPxVertical) }), [cmScale]);
};

export { usePrintUnits };
export type { printUnitsType };
