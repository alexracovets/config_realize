import type { buildCheckoutOrderExportParamsType, checkoutOrderExportLineType, checkoutOrderExportType } from '@types';
import { resolveCartItemDisplayPreview } from '@utils/productCatalog/resolveCartItemDisplayPreview';

const CHECKOUT_VAT_RATE = 0.22;

const calcVatFromGross = (gross: number) => (gross * CHECKOUT_VAT_RATE) / (1 + CHECKOUT_VAT_RATE);

const createCheckoutOrderNumber = () => `#${Math.floor(1_000_000_000 + Math.random() * 9_000_000_000)}`;

const formatCheckoutOrderDate = (date = new Date()) => new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);

const EMPTY_RECIPIENT = {
  name: '',
  email: '',
  phone: '',
};

const EMPTY_SHIPPING_ADDRESS = {
  street: '',
  postalCode: '',
  city: '',
  country: '',
};

const buildCheckoutOrderExport = ({
  products,
  cartItems,
  previews,
  subtotal,
  discountAmount,
  shippingCost,
  grandTotal,
  orderMeta,
}: buildCheckoutOrderExportParamsType): checkoutOrderExportType => {
  const lines: checkoutOrderExportLineType[] = products.flatMap((product) => {
    const cartItem = cartItems.find((item) => item.id === product.cartItemId);
    const previewSrc = cartItem ? resolveCartItemDisplayPreview(cartItem, previews[product.cartItemId]) : '';
    const unitPriceGross = product.business.price;
    const modelName = product.business.name || 'Prodotto';

    return product.rows.map((row) => {
      const lineTotalGross = unitPriceGross * row.quantity;

      return {
        modelName,
        previewSrc,
        size: row.size,
        name: row.name.trim() || '-',
        number: row.number.trim() || '-',
        quantity: row.quantity,
        unitPriceGross,
        lineTotalGross,
        vatAmount: calcVatFromGross(lineTotalGross),
      };
    });
  });

  return {
    orderNumber: orderMeta?.orderNumber ?? createCheckoutOrderNumber(),
    orderDate: orderMeta?.orderDate ?? formatCheckoutOrderDate(),
    recipient: EMPTY_RECIPIENT,
    shippingAddress: EMPTY_SHIPPING_ADDRESS,
    billingNote: "Corrisponde all'indirizzo di spedizione",
    lines,
    subtotal,
    discountAmount,
    shippingCost,
    vatTotal: calcVatFromGross(grandTotal),
    grandTotal,
  };
};

export { buildCheckoutOrderExport, formatCheckoutOrderDate };
