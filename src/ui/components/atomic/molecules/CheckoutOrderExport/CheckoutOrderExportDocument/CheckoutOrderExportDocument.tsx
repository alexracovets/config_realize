'use client';

import type { checkoutOrderExportType } from '@types';
import {
  CHECKOUT_ORDER_EXPORT_BILLING_TITLE,
  CHECKOUT_ORDER_EXPORT_COPYRIGHT_PREFIX,
  CHECKOUT_ORDER_EXPORT_EMAIL,
  CHECKOUT_ORDER_EXPORT_LOGO_SRC,
  CHECKOUT_ORDER_EXPORT_ORDER_DATE_LABEL,
  CHECKOUT_ORDER_EXPORT_ORDER_NUMBER_LABEL,
  CHECKOUT_ORDER_EXPORT_RECIPIENT_TITLE,
  CHECKOUT_ORDER_EXPORT_SHIPPING_TITLE,
  CHECKOUT_ORDER_EXPORT_TITLE,
  CHECKOUT_ORDER_EXPORT_VAT_INCLUDED_LABEL,
  CHECKOUT_ORDER_EXPORT_VAT_LABEL,
  CHECKOUT_ORDER_EXPORT_WEBSITE,
  CHECKOUT_SUMMARY_TRUST_ITEMS,
} from '@constants';
import { priceFormat } from '@utils';
import { AtomImage } from '@atoms';
import { ORDER_EXPORT_DOCUMENT_STYLES } from '@molecules/CheckoutOrderExport/orderExportDocumentStyles';
import { CheckoutOrderExportTrustIcon } from '@molecules/CheckoutOrderExport/CheckoutOrderExportTrustIcon';

type checkoutOrderExportDocumentPropsType = {
  exportData: checkoutOrderExportType;
};

const formatShippingAddressLine = (shippingAddress: checkoutOrderExportType['shippingAddress']) =>
  `${shippingAddress.street}, ${shippingAddress.postalCode} ${shippingAddress.city}, ${shippingAddress.country}`;

const CheckoutOrderExportDocument = ({ exportData }: checkoutOrderExportDocumentPropsType) => {
  const { recipient, shippingAddress, lines } = exportData;
  const currentYear = new Date().getFullYear();

  return (
    <>
      <style>{ORDER_EXPORT_DOCUMENT_STYLES}</style>
      <div className="order-export" data-testid="checkout-order-export-document">
        <div className="order-export__content">
          <header className="order-export__header">
            <div className="order-export__header-top">
              <AtomImage
                src={CHECKOUT_ORDER_EXPORT_LOGO_SRC}
                alt="Realize You"
                className="order-export__logo"
                width={170}
                height={40}
                priority
                data-testid="checkout-order-export-logo"
                data-order-export-preview=""
              />
              <div className="order-export__contact">
                <p>{CHECKOUT_ORDER_EXPORT_WEBSITE}</p>
                <p>{CHECKOUT_ORDER_EXPORT_EMAIL}</p>
              </div>
            </div>
            <hr className="order-export__divider" data-testid="checkout-order-export-header-divider" />
          </header>

          <div className="order-export__info">
            <div className="order-export__customer">
              <div className="order-export__section-row">
                <span className="order-export__section-label">{CHECKOUT_ORDER_EXPORT_RECIPIENT_TITLE}:</span>
                <span className="order-export__section-value">
                  {recipient.name} {recipient.email} {recipient.phone}
                </span>
              </div>

              <div className="order-export__section-row">
                <span className="order-export__section-label">{CHECKOUT_ORDER_EXPORT_SHIPPING_TITLE}:</span>
                <span className="order-export__section-value">{formatShippingAddressLine(shippingAddress)}</span>
              </div>

              <div className="order-export__section-row">
                <span className="order-export__section-label">{CHECKOUT_ORDER_EXPORT_BILLING_TITLE}:</span>
                <span className="order-export__section-value">{exportData.billingNote}</span>
              </div>
            </div>

            <div className="order-export__title-block">
              <h1 className="order-export__title">{CHECKOUT_ORDER_EXPORT_TITLE}</h1>
              <div className="order-export__meta-grid">
                <div className="order-export__meta-item">
                  <span className="order-export__meta-label">{CHECKOUT_ORDER_EXPORT_ORDER_DATE_LABEL}</span>
                  <span>{exportData.orderDate}</span>
                </div>
                <div className="order-export__meta-item">
                  <span className="order-export__meta-label">{CHECKOUT_ORDER_EXPORT_ORDER_NUMBER_LABEL}</span>
                  <span>{exportData.orderNumber}</span>
                </div>
              </div>
            </div>
          </div>

          <table className="order-export__table">
            <thead>
              <tr>
                <th style={{ width: '11%' }}>
                  <span className="order-export__th-text">Modello</span>
                </th>
                <th style={{ width: '9%' }}>
                  <span className="order-export__th-text">Taglia</span>
                </th>
                <th style={{ width: '16%' }}>
                  <span className="order-export__th-text">Nome</span>
                </th>
                <th style={{ width: '9%' }}>
                  <span className="order-export__th-text">Numero</span>
                </th>
                <th style={{ width: '8%' }}>
                  <span className="order-export__th-text">QTY</span>
                </th>
                <th style={{ width: '13%' }}>
                  <span className="order-export__th-text">{CHECKOUT_ORDER_EXPORT_VAT_LABEL}</span>
                </th>
                <th style={{ width: '14%' }}>
                  <span className="order-export__th-text">Prezzo</span>
                </th>
                <th style={{ width: '20%' }}>
                  <span className="order-export__th-text">Prezzo Totale</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {lines.map((line, index) => (
                <tr key={`${line.modelName}-${line.size}-${index}`} className="order-export__table-row">
                  <td>
                    {line.previewSrc ? (
                      <AtomImage
                        src={line.previewSrc}
                        alt={line.modelName}
                        className="order-export__preview"
                        width={40}
                        height={40}
                        data-order-export-preview=""
                      />
                    ) : (
                      <span className="order-export__preview order-export__preview--empty" aria-hidden />
                    )}
                  </td>
                  <td>{line.size}</td>
                  <td>{line.name}</td>
                  <td>{line.number}</td>
                  <td>{line.quantity}</td>
                  <td>{priceFormat(line.vatAmount)}</td>
                  <td>{priceFormat(line.unitPriceGross)}</td>
                  <td>{priceFormat(line.lineTotalGross)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <hr className="order-export__divider order-export__divider--totals" data-testid="checkout-order-export-totals-divider" />

          <div className="order-export__totals">
            <div className="order-export__totals-box">
              <div className="order-export__totals-row">
                <span className="order-export__totals-label">Subtotale</span>
                <span>{priceFormat(exportData.subtotal)}</span>
              </div>
              {exportData.discountAmount > 0 && (
                <div className="order-export__totals-row">
                  <span className="order-export__totals-label">Sconto</span>
                  <span>-{priceFormat(exportData.discountAmount)}</span>
                </div>
              )}
              {exportData.shippingCost > 0 && (
                <div className="order-export__totals-row">
                  <span className="order-export__totals-label">Spedizione</span>
                  <span>{priceFormat(exportData.shippingCost)}</span>
                </div>
              )}
              <div className="order-export__totals-row">
                <span className="order-export__totals-label">{CHECKOUT_ORDER_EXPORT_VAT_LABEL}</span>
                <span>{priceFormat(exportData.vatTotal)}</span>
              </div>
              <div className="order-export__totals-row order-export__totals-row--grand">
                <span className="order-export__totals-label">Prezzo Totale</span>
                <span className="order-export__totals-grand">{priceFormat(exportData.grandTotal)}</span>
              </div>
              <p className="order-export__totals-note">{CHECKOUT_ORDER_EXPORT_VAT_INCLUDED_LABEL}</p>
            </div>
          </div>
        </div>

        <footer className="order-export__footer" data-testid="checkout-order-export-footer">
          <hr className="order-export__divider order-export__divider--footer-top" data-testid="checkout-order-export-footer-top-divider" />
          <ul className="order-export__trust-list">
            {CHECKOUT_SUMMARY_TRUST_ITEMS.map(({ icon, label }) => (
              <li key={label} className="order-export__trust-item">
                <span className="order-export__trust-icon-wrap" aria-hidden>
                  <CheckoutOrderExportTrustIcon icon={icon} />
                </span>
                <span className="order-export__trust-label">{label}</span>
              </li>
            ))}
          </ul>
          <hr className="order-export__divider" data-testid="checkout-order-export-footer-divider" />
          <div className="order-export__footer-bottom">
            <p className="order-export__copyright" data-testid="checkout-order-export-copyright">
              {CHECKOUT_ORDER_EXPORT_COPYRIGHT_PREFIX} © {currentYear} · {CHECKOUT_ORDER_EXPORT_WEBSITE} · {CHECKOUT_ORDER_EXPORT_EMAIL}
            </p>
          </div>
        </footer>
      </div>
    </>
  );
};

export { CheckoutOrderExportDocument };
