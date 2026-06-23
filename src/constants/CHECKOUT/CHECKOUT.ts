const CHECKOUT_MIN_ROW_QUANTITY = 1;

const CHECKOUT_MAX_ROW_QUANTITY = 999;

const CHECKOUT_DEFAULT_SIZE = 'M';

const clampCheckoutRowQuantity = (quantity: number) => Math.min(CHECKOUT_MAX_ROW_QUANTITY, Math.max(CHECKOUT_MIN_ROW_QUANTITY, quantity));

export { CHECKOUT_DEFAULT_SIZE, CHECKOUT_MAX_ROW_QUANTITY, CHECKOUT_MIN_ROW_QUANTITY, clampCheckoutRowQuantity };
