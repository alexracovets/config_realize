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

export {
  CHECKOUT_SUMMARY_PROCEED_LABEL,
  CHECKOUT_SUMMARY_SHIPPING_LABEL,
  CHECKOUT_SUMMARY_TIMELINE_STEPS,
  CHECKOUT_SUMMARY_TIMELINE_TITLE,
  CHECKOUT_SUMMARY_TITLE,
  CHECKOUT_SUMMARY_TOTAL_LABEL,
  CHECKOUT_SUMMARY_TRUST_ITEMS,
  CHECKOUT_SUMMARY_VAT_LABEL,
};
