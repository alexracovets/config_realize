const ORDER_EXPORT_DOCUMENT_STYLES = `
.order-export {
  box-sizing: border-box;
  width: 794px;
  max-width: 100%;
  margin: 0 auto;
  padding: 24px 36px 32px;
  color: #000;
  font-family: Inter, Arial, sans-serif;
  font-size: 12px;
  line-height: 1.45;
  background: #fff;
}

.order-export *,
.order-export *::before,
.order-export *::after {
  box-sizing: border-box;
}

.order-export__divider {
  width: 100%;
  height: 0;
  border: 0;
  border-top: 1px solid #e0e0e0;
  margin: 0;
}

.order-export__header {
  margin-bottom: 0;
}

.order-export__header-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
}

.order-export__header .order-export__divider {
  margin-top: 10px;
  margin-bottom: 10px;
}

.order-export__logo {
  height: 40px;
  width: auto;
}

.order-export__contact {
  text-align: right;
  font-size: 11px;
  color: #888;
}

.order-export__contact p {
  margin: 0;
  line-height: 1.5;
}

.order-export__info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  margin-bottom: 28px;
}

.order-export__customer {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.order-export__section-row {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 6px;
  font-size: 12px;
  line-height: 1.5;
}

.order-export__section-label {
  flex-shrink: 0;
  color: #888;
  font-weight: 400;
}

.order-export__section-value {
  color: #000;
  font-weight: 400;
}

.order-export__title-block {
  text-align: right;
}

.order-export__title {
  margin: 0 0 20px;
  font-size: 28px;
  font-weight: 700;
  line-height: 1.1;
  color: #000;
}

.order-export__meta-grid {
  display: inline-grid;
  grid-template-columns: auto auto;
  gap: 24px 32px;
  text-align: left;
}

.order-export__meta-item {
  font-size: 12px;
  color: #000;
}

.order-export__meta-label {
  display: block;
  margin-bottom: 4px;
  font-weight: 400;
  color: #888;
}

.order-export__table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 0;
  table-layout: fixed;
}

.order-export__table th,
.order-export__table td {
  border: 1px solid #e0e0e0;
  text-align: center;
}

.order-export__table th {
  padding: 0 8px;
  background: #f2f2f2;
  font-size: 0;
  line-height: 0;
  white-space: nowrap;
}

.order-export__table thead th {
  height: 10px;
  padding-top: 6px;
  padding-bottom: 16px;
  margin: 0;
  vertical-align: middle;
}

.order-export__table th::before {
  content: '';
  display: inline-block;
  height: 100%;
  vertical-align: middle;
}

.order-export__th-text {
  display: inline-block;
  font-size: 11px;
  font-weight: 600;
  line-height: 1;
  color: #000;
  vertical-align: middle;
  white-space: nowrap;
}

.order-export__table td {
  padding: 8px 6px;
  vertical-align: middle;
  word-break: break-word;
  font-size: 11px;
  line-height: 1.3;
  color: #000;
  background: #fff;
}

.order-export__preview {
  display: block;
  width: 40px;
  height: 40px;
  margin: 0 auto;
  object-fit: contain;
}

.order-export__preview--empty {
  display: inline-block;
}

.order-export__divider--totals {
  margin: 24px 0;
}

.order-export__totals {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 0;
}

.order-export__totals-box {
  width: fit-content;
  min-width: 200px;
  max-width: 100%;
  margin-left: auto;
}

.order-export__totals-row {
  display: grid;
  grid-template-columns: auto auto;
  justify-content: end;
  align-items: baseline;
  column-gap: 16px;
  margin-bottom: 4px;
  font-size: 12px;
  line-height: 1.4;
  color: #888;
}

.order-export__totals-row span:last-child {
  font-size: 12px;
  font-weight: 400;
  color: #000;
  text-align: right;
  white-space: nowrap;
}

.order-export__totals-row--grand {
  align-items: baseline;
  margin-top: 12px;
  margin-bottom: 4px;
  color: #000;
}

.order-export__totals-row--grand .order-export__totals-label {
  color: #000;
}

.order-export__totals-label {
  font-weight: 400;
  white-space: nowrap;
}

.order-export__totals-row--grand .order-export__totals-label {
  font-size: 16px;
  font-weight: 700;
  line-height: 1.2;
}

.order-export__totals-grand {
  font-size: 24px;
  font-weight: 700;
  line-height: 1;
  color: #000;
}

.order-export__totals-note {
  margin: 2px 0 0;
  font-size: 10px;
  line-height: 1.3;
  color: #888;
  text-align: right;
}

.order-export__footer {
  box-sizing: border-box;
  width: calc(100% + 72px);
  margin: 10px -36px 0;
  padding: 0 36px 8px;
}

.order-export__footer-bottom {
  position: relative;
}

.order-export__divider--footer-top {
  margin-bottom: 6px;
  display: none;
}

.order-export__trust-list {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
  margin: 0;
  padding: 0;
  list-style: none;
}

.order-export__trust-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  flex: 0 0 auto;
}

.order-export__trust-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 12px;
  height: 12px;
  flex-shrink: 0;
  line-height: 0;
  transform: translateY(6px);
}

.order-export__trust-icon {
  display: block;
  width: 12px;
  height: 12px;
  color: #454545;
}

.order-export__trust-label {
  font-size: 11px;
  font-weight: 500;
  line-height: 1;
  letter-spacing: 0;
  color: #454545;
  white-space: nowrap;
}

.order-export__footer .order-export__divider:not(.order-export__divider--footer-top) {
  margin-top: 16px;
  margin-bottom: 10px;
}

.order-export__copyright {
  margin: 0;
  text-align: center;
  font-size: 10px;
  color: #888;
}

.order-export--pdf-capture {
  width: 794px;
  display: flex;
  flex-direction: column;
  padding: 10px 36px 20px;
  margin: 0;
}

.order-export--pdf-capture .order-export__content {
  flex: 1 1 auto;
}

.order-export--pdf-capture.order-export--pdf-single-page {
  height: 1123px;
}

.order-export--pdf-capture.order-export--pdf-single-page .order-export__footer {
  margin-top: auto;
  flex-shrink: 0;
}

.order-export-pages {
  display: flex;
  flex-direction: column;
  gap: 0;
  background: #fff;
}

.order-export-page {
  box-sizing: border-box;
  width: 794px;
  height: 1123px;
  overflow: hidden;
  background: #fff;
  color: #000;
  font-family: Inter, Arial, sans-serif;
  font-size: 12px;
  line-height: 1.45;
}

.order-export-page__inner {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 24px 36px 20px;
}

.order-export-page--continuation .order-export-page__inner {
  padding-top: 24px;
}

.order-export-page__content {
  flex: 1 1 auto;
  min-height: 0;
}

.order-export__footer--page {
  flex-shrink: 0;
  margin-top: auto;
  padding-top: 24px;
}

.order-export__table-row {
  page-break-inside: avoid;
  break-inside: avoid;
}
`;

export { ORDER_EXPORT_DOCUMENT_STYLES };
