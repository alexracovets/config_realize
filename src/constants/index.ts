import type { configuratorStepValueType } from '@configurator/types';
import type { modelIdType } from '@types';

const DEFAULT_CONFIGURATOR_MODEL_ID: modelIdType = 'federer_pallavolo';
const DEFAULT_CONFIGURATOR_SLUG = 'federer_pallavolo';
const DEFAULT_CONFIGURATOR_COLLECTION_HANDLE = '';

// --- Configurator copy ---

const CONFIGURATOR_PRODUCT_DESCRIPTION = "Eventuali liste dei giocatori, quantità e taglie da inserire dopo in 'Completa config.'";
const CONFIGURATOR_DEFAULT_MINIMUM_COUNT = 5;

type collectionVolumeDiscountConfigType = {
  minimumOrderCount: number;
  bonusCount: number;
  bonusDiscount: number;
};

const CONFIGURATOR_COLLECTION_VOLUME_DISCOUNTS: Record<string, collectionVolumeDiscountConfigType> = {
  'completo-gara-calcio': { minimumOrderCount: 5, bonusCount: 25, bonusDiscount: 20 },
  'completo-gara-pallavolo': { minimumOrderCount: 5, bonusCount: 25, bonusDiscount: 20 },
  'completo-gara-basket': { minimumOrderCount: 5, bonusCount: 25, bonusDiscount: 20 },
  completo: { minimumOrderCount: 5, bonusCount: 25, bonusDiscount: 20 },
};

const resolveShopifyCollectionVolumeDiscount = (collectionHandle: string): collectionVolumeDiscountConfigType | null => {
  const normalizedHandle = collectionHandle.trim();
  if (!normalizedHandle) return null;

  return CONFIGURATOR_COLLECTION_VOLUME_DISCOUNTS[normalizedHandle] ?? null;
};

const buildMinimumQuantityLabel = (minimumCount: number) => `Minimo ${minimumCount} pz`;
const buildVolumeDiscountLabel = (bonusCount: number, bonusDiscount: number) => `>${bonusCount} pezzi +${bonusDiscount}% di sconto`;
const CONFIGURATOR_GRADIENT_ACTIVE_LABEL = 'Sfumatura attiva';
const CONFIGURATOR_NAME_POSITION_SELECT_LABEL = 'Dove desideri inserire il nome?';
const CONFIGURATOR_NUMBER_POSITION_SELECT_LABEL = 'Dove desideri inserire il numero?';
const CONFIGURATOR_TESTO_POSITION_SELECT_LABEL = 'Dove desideri inserire il testo?';
const CONFIGURATOR_POSITION_SELECT_PLACEHOLDER = 'Seleziona posizione';
const CONFIGURATOR_UPLOADED_FILES_LABEL = 'File caricati';
const ADD_PRODUCT_DESIGN_MODAL_CONFIRM_LABEL = 'Sì';
const ADD_PRODUCT_DESIGN_MODAL_DECLINE_LABEL = 'No';

const buildAddProductDesignModalTitle = (productLabel: string): string => `Desideri lo stesso disegno anche su ${productLabel}?`;
const CONFIGURATOR_DEFAULT_BRAND_LOGO_TITLE = 'Brand Logo';
const CONFIGURATOR_DEFAULT_BRAND_LOGO_DESCRIPTION = 'I loghi di Realize cambieranno colore per adattarsi alla grafica senza preavviso.';
const CONFIGURATOR_DEFAULT_BRAND_LOGO_SRC = '/svg/logo.svg';

type configuratorStepMetaItemType = {
  value: configuratorStepValueType;
  label: string;
  step: number;
};

const CONFIGURATOR_STEP_META: configuratorStepMetaItemType[] = [
  { value: 'colore', label: 'Colore', step: 1 },
  { value: 'design', label: 'Design', step: 2 },
  { value: 'shading', label: 'Sfumatura', step: 3 },
  { value: 'name', label: 'Nome', step: 4 },
  { value: 'number', label: 'Numero', step: 5 },
  { value: 'testo', label: 'Testo', step: 6 },
  { value: 'logo', label: 'Logo', step: 7 },
];

// --- Checkout ---

const CHECKOUT_MIN_ROW_QUANTITY = 1;
const CHECKOUT_MAX_ROW_QUANTITY = 999;
const CHECKOUT_DEFAULT_SIZE = 'M';

const clampCheckoutRowQuantity = (quantity: number) => Math.min(CHECKOUT_MAX_ROW_QUANTITY, Math.max(CHECKOUT_MIN_ROW_QUANTITY, quantity));

const CHECKOUT_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'] as const;
const CHECKOUT_SHIPPING_DAYS_LABEL = 'Spedizione entro 15-20 giorni lavorativi.';

const CHECKOUT_CONFIGURATION_TABLE_COLUMNS = [
  { id: 'row', header: 'Riga', size: 60, minSize: 60, maxSize: 60 },
  { id: 'size', header: 'Taglia', size: 88, minSize: 88, maxSize: 88 },
  { id: 'name', header: 'Nome', size: 176, minSize: 176, maxSize: 176 },
  { id: 'number', header: 'Numero', size: 128, minSize: 128, maxSize: 128 },
  { id: 'quantity', header: 'Quantità', size: 132, minSize: 132, maxSize: 132 },
  { id: 'actions', header: 'Modifica', size: 136, minSize: 136, maxSize: 136 },
] as const;

const CHECKOUT_SIZE_SELECT_OPTIONS = CHECKOUT_SIZES.map((size) => ({ label: size, value: size }));
const CHECKOUT_TABLE_ADD_ROW_LABEL = 'Aggiungi riga';

const CHECKOUT_SUMMARY_TITLE = 'Riepilogo';
const CHECKOUT_SUMMARY_PROCEED_LABEL = 'Prosegui';
const CHECKOUT_SUMMARY_TIMELINE_TITLE = 'Se ordina ora';
const CHECKOUT_SUMMARY_SHIPPING_LABEL = 'Spese di spedizione';
const CHECKOUT_SUMMARY_TOTAL_LABEL = 'Importo Totale:';
const CHECKOUT_SUMMARY_VAT_LABEL = 'IVA 22% inclusa';

const CHECKOUT_SUMMARY_TRUST_ITEMS = [
  { icon: 'shirt', label: 'Prodotti 100% Made in Italy' },
  { icon: 'shieldCheck', label: 'Sicurezza Checkout' },
  { icon: 'truck', label: 'Consegna sicura e veloce' },
  { icon: 'star', label: 'Recensioni Trustpilot 4,8/5' },
] as const;

const CHECKOUT_SUMMARY_TIMELINE_STEPS = [
  { icon: 'clipboardCheck', label: 'Ordine', dateKey: 'order' },
  { icon: 'truck', label: 'Trasporto', dateKey: 'transport' },
  { icon: 'home', label: 'Consegnato', dateKey: 'delivered' },
] as const;

const CHECKOUT_CUTTING_EXPORT_PATH = '/dev/order-cutting-export';
const CHECKOUT_CUTTING_EXPORT_FILENAME = 'modulo-tessitura.pdf';
const CHECKOUT_CONFIG_EXPORT_FILENAME = 'config.json';
const CHECKOUT_ORDER_EXPORT_TITLE = "Conferma d'ordine";
const CHECKOUT_ORDER_EXPORT_FILENAME = 'conferma-ordine.pdf';
const CHECKOUT_ORDER_EXPORT_WEBSITE = 'www.realize.com';
const CHECKOUT_ORDER_EXPORT_EMAIL = 'email.is.here@email';
const CHECKOUT_ORDER_EXPORT_LOGO_SRC = '/svg/logo_you.svg';
const CHECKOUT_ORDER_EXPORT_RECIPIENT_TITLE = 'Destinatario';
const CHECKOUT_ORDER_EXPORT_SHIPPING_TITLE = 'Indirizzo di spedizione';
const CHECKOUT_ORDER_EXPORT_BILLING_TITLE = 'Indirizzo di fatturazione';
const CHECKOUT_ORDER_EXPORT_ORDER_DATE_LABEL = "Data dell'ordine:";
const CHECKOUT_ORDER_EXPORT_ORDER_NUMBER_LABEL = "Numero d'ordine:";
const CHECKOUT_ORDER_EXPORT_VAT_LABEL = 'IVA 22%';
const CHECKOUT_ORDER_EXPORT_VAT_INCLUDED_LABEL = 'IVA 22% inclusa';
const CHECKOUT_ORDER_EXPORT_COPYRIGHT_PREFIX = 'All Rights Reserved';

const ORDER_CUTTING_EXPORT_DATA_NOT_SPECIFIED = 'Dati non indicati';
const ORDER_CUTTING_EXPORT_DOWNLOAD_PLACEHOLDER_HREF = 'about:blank';

// --- UI palette ---

const PALETTE_COLORS = [
  '#FFFFFF',
  '#000000',
  '#818181',
  '#4A4A4A',
  '#CBAA6D',
  '#A3E8FF',
  '#1DC9C6',
  '#3E94F9',
  '#0027F8',
  '#03094D',
  '#C7E666',
  '#0E6F0C',
  '#F6FF00',
  '#FFCF00',
  '#681010',
  '#E33D02',
  '#D0021B',
  '#E70468',
  '#E45FB6',
  '#8D0FB4',
] as const;

// --- Logo upload (UI constraints) ---

const LOGO_MAX_FILE_SIZE = 10 * 1024 * 1024;
const LOGO_ACCEPTED_INPUT = '.eps,.ps,.pdf,.ai,.svg,.png,.jpg,.jpeg,.bmp,.tiff,.tif,.webp';
const LOGO_SUPPORTED_LABEL = 'eps, ps, pdf, ai, svg, png, jpg, jpeg, bmp, tiff, tif';
const LOGO_ACCEPTED_EXTENSIONS = new Set(['eps', 'ps', 'pdf', 'ai', 'svg', 'png', 'jpg', 'jpeg', 'bmp', 'tiff', 'tif', 'webp']);
const LOGO_ACCEPTED_MIMES = new Set([
  'application/postscript',
  'application/eps',
  'application/pdf',
  'application/illustrator',
  'image/svg+xml',
  'image/png',
  'image/jpeg',
  'image/bmp',
  'image/tiff',
  'image/webp',
  '',
]);

// --- Media ---

const TUTORIAL_VIDEO_URL = 'https://youtu.be/dQw4w9WgXcQ?si=uL2ObwuN8FpWsScY';
const VIDEO_PLAYER_DEFAULT_VOLUME = 0.2;
const VIDEO_PLAYER_YOUTUBE_CONFIG = {
  enablejsapi: 1,
  rel: 0,
  iv_load_policy: 3,
  cc_load_policy: 0,
  fs: 0,
  disablekb: 1,
  playsinline: 1,
  color: 'white',
} as const;

export type { configuratorStepMetaItemType };

export {
  CHECKOUT_CONFIGURATION_TABLE_COLUMNS,
  CHECKOUT_DEFAULT_SIZE,
  CHECKOUT_MAX_ROW_QUANTITY,
  CHECKOUT_MIN_ROW_QUANTITY,
  CHECKOUT_SHIPPING_DAYS_LABEL,
  CHECKOUT_SIZE_SELECT_OPTIONS,
  CHECKOUT_SUMMARY_PROCEED_LABEL,
  CHECKOUT_SUMMARY_SHIPPING_LABEL,
  CHECKOUT_SUMMARY_TIMELINE_STEPS,
  CHECKOUT_SUMMARY_TIMELINE_TITLE,
  CHECKOUT_SUMMARY_TITLE,
  CHECKOUT_SUMMARY_TOTAL_LABEL,
  CHECKOUT_SUMMARY_TRUST_ITEMS,
  CHECKOUT_SUMMARY_VAT_LABEL,
  CHECKOUT_CONFIG_EXPORT_FILENAME,
  CHECKOUT_CUTTING_EXPORT_FILENAME,
  CHECKOUT_CUTTING_EXPORT_PATH,
  CHECKOUT_ORDER_EXPORT_BILLING_TITLE,
  CHECKOUT_ORDER_EXPORT_COPYRIGHT_PREFIX,
  CHECKOUT_ORDER_EXPORT_EMAIL,
  CHECKOUT_ORDER_EXPORT_FILENAME,
  CHECKOUT_ORDER_EXPORT_LOGO_SRC,
  CHECKOUT_ORDER_EXPORT_ORDER_DATE_LABEL,
  CHECKOUT_ORDER_EXPORT_ORDER_NUMBER_LABEL,
  CHECKOUT_ORDER_EXPORT_RECIPIENT_TITLE,
  CHECKOUT_ORDER_EXPORT_SHIPPING_TITLE,
  CHECKOUT_ORDER_EXPORT_TITLE,
  CHECKOUT_ORDER_EXPORT_VAT_INCLUDED_LABEL,
  CHECKOUT_ORDER_EXPORT_VAT_LABEL,
  CHECKOUT_ORDER_EXPORT_WEBSITE,
  ORDER_CUTTING_EXPORT_DATA_NOT_SPECIFIED,
  ORDER_CUTTING_EXPORT_DOWNLOAD_PLACEHOLDER_HREF,
  CHECKOUT_TABLE_ADD_ROW_LABEL,
  ADD_PRODUCT_DESIGN_MODAL_CONFIRM_LABEL,
  ADD_PRODUCT_DESIGN_MODAL_DECLINE_LABEL,
  buildAddProductDesignModalTitle,
  buildMinimumQuantityLabel,
  buildVolumeDiscountLabel,
  CONFIGURATOR_DEFAULT_BRAND_LOGO_DESCRIPTION,
  CONFIGURATOR_DEFAULT_BRAND_LOGO_SRC,
  CONFIGURATOR_DEFAULT_BRAND_LOGO_TITLE,
  CONFIGURATOR_DEFAULT_MINIMUM_COUNT,
  CONFIGURATOR_GRADIENT_ACTIVE_LABEL,
  CONFIGURATOR_NAME_POSITION_SELECT_LABEL,
  CONFIGURATOR_NUMBER_POSITION_SELECT_LABEL,
  CONFIGURATOR_POSITION_SELECT_PLACEHOLDER,
  CONFIGURATOR_PRODUCT_DESCRIPTION,
  CONFIGURATOR_STEP_META,
  CONFIGURATOR_TESTO_POSITION_SELECT_LABEL,
  CONFIGURATOR_UPLOADED_FILES_LABEL,
  DEFAULT_CONFIGURATOR_COLLECTION_HANDLE,
  DEFAULT_CONFIGURATOR_MODEL_ID,
  DEFAULT_CONFIGURATOR_SLUG,
  LOGO_ACCEPTED_EXTENSIONS,
  LOGO_ACCEPTED_INPUT,
  LOGO_ACCEPTED_MIMES,
  LOGO_MAX_FILE_SIZE,
  LOGO_SUPPORTED_LABEL,
  PALETTE_COLORS,
  resolveShopifyCollectionVolumeDiscount,
  TUTORIAL_VIDEO_URL,
  VIDEO_PLAYER_DEFAULT_VOLUME,
  VIDEO_PLAYER_YOUTUBE_CONFIG,
  clampCheckoutRowQuantity,
};
