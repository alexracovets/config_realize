import type { CSSProperties } from 'react';

import type { checkoutConfigurationTableColumnType } from '@types';

const getCheckoutColumnStyle = (column: checkoutConfigurationTableColumnType): CSSProperties => {
  if (column.meta?.grow) {
    return { minWidth: column.minSize };
  }

  return {
    width: column.size,
    minWidth: column.minSize,
    maxWidth: column.maxSize,
  };
};

export { getCheckoutColumnStyle };
