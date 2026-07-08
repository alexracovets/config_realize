import type { modelIdType } from '@types';

interface checkoutE2eOrderMetaType {
  orderNumber: string;
  orderDate: string;
}

interface checkoutE2eRowFixtureType {
  size: string;
  name: string;
  number: string;
  testoTexts: string[];
  quantity: number;
}

interface checkoutE2eFixtureType {
  product: {
    modelId: modelIdType;
    collectionHandle: string;
    slug: string;
    name: string;
    price: number;
  };
  rows: checkoutE2eRowFixtureType[];
  previewSrc?: string;
  orderMeta?: checkoutE2eOrderMetaType;
}

declare global {
  interface Window {
    __checkoutE2e?: {
      orderMeta?: checkoutE2eOrderMetaType;
      seedOrderExportFixture: (fixture: checkoutE2eFixtureType) => void;
      revealOrderExportDocument: () => void;
      getOrderExportText: () => string;
    };
  }
}

export type { checkoutE2eFixtureType, checkoutE2eOrderMetaType, checkoutE2eRowFixtureType };
