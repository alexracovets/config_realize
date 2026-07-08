import type { cartItemType, checkoutProductType } from '@types';

interface checkoutOrderExportRecipientType {
  name: string;
  email: string;
  phone: string;
}

interface checkoutOrderExportAddressType {
  street: string;
  postalCode: string;
  city: string;
  country: string;
}

interface checkoutOrderExportLineType {
  modelName: string;
  previewSrc: string;
  size: string;
  name: string;
  number: string;
  quantity: number;
  unitPriceGross: number;
  lineTotalGross: number;
  vatAmount: number;
}

interface checkoutOrderExportType {
  orderNumber: string;
  orderDate: string;
  recipient: checkoutOrderExportRecipientType;
  shippingAddress: checkoutOrderExportAddressType;
  billingNote: string;
  lines: checkoutOrderExportLineType[];
  subtotal: number;
  discountAmount: number;
  shippingCost: number;
  vatTotal: number;
  grandTotal: number;
}

interface checkoutOrderExportMetaType {
  orderNumber: string;
  orderDate: string;
}

interface buildCheckoutOrderExportParamsType {
  products: checkoutProductType[];
  cartItems: cartItemType[];
  previews: Record<string, string>;
  subtotal: number;
  discountAmount: number;
  shippingCost: number;
  grandTotal: number;
  orderMeta?: checkoutOrderExportMetaType;
}

export type {
  buildCheckoutOrderExportParamsType,
  checkoutOrderExportAddressType,
  checkoutOrderExportLineType,
  checkoutOrderExportMetaType,
  checkoutOrderExportRecipientType,
  checkoutOrderExportType,
};
