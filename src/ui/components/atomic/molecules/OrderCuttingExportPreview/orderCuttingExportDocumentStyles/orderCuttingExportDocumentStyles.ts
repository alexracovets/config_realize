const ORDER_CUTTING_EXPORT_DOCUMENT_STYLES = `
.cutting-export {
  box-sizing: border-box;
  width: 794px;
  max-width: 100%;
  margin: 0 auto;
  padding: 24px 28px 32px;
  color: #454545;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 11px;
  line-height: 1.35;
  background: #fff;
}

.cutting-export *,
.cutting-export *::before,
.cutting-export *::after {
  box-sizing: border-box;
}

.cutting-export__title {
  margin: 0 0 4px;
  color: #000;
  font-size: 18px;
  font-weight: 700;
  text-align: center;
  text-transform: uppercase;
}

.cutting-export__subtitle {
  margin: 0 0 16px;
  color: #000;
  font-size: 11px;
  font-weight: 700;
  text-align: center;
  text-transform: uppercase;
}

.cutting-export__table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 18px;
  table-layout: fixed;
}

.cutting-export__table th,
.cutting-export__table td {
  border: 1px solid #CDCDCD;
  padding: 8px;
  height: 1px;
  min-height: 28px;
  vertical-align: middle;
  text-align: left;
  word-break: break-word;
}

.cutting-export__table th {
  width: 22%;
  color: #000;
  font-weight: 700;
  background: #E8E8EB;
}

.cutting-export__table td {
  color: #454545;
  font-weight: 400;
}

.cutting-export__product {
  margin-bottom: 24px;
  padding-top: 8px;
  border-top: 1px solid #E8E8EB;
}

.cutting-export__product-header {
  margin-bottom: 14px;
}

.cutting-export__product-title {
  margin: 0 0 4px;
  color: #000;
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
}

.cutting-export__product-meta {
  margin: 0;
  font-size: 10px;
  color: #979797;
}

.cutting-export__steps {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 18px;
}

.cutting-export__step {
  border: 1px solid #CDCDCD;
  border-radius: 4px;
  overflow: hidden;
  background: #fff;
}

.cutting-export__step-header {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  min-height: 32px;
  padding: 8px;
  border-bottom: 1px solid #CDCDCD;
  background: #E8E8EB;
  color: #000;
  font-size: 11px;
  font-weight: 700;
  line-height: 1.2;
  text-transform: uppercase;
}

.cutting-export__step-index {
  display: flex;
  align-items: center;
  min-width: 18px;
}

.cutting-export__step-title {
  display: flex;
  align-items: center;
}

.cutting-export__step-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 8px;
}

.cutting-export__step-empty {
  margin: 0;
  font-style: italic;
  color: #979797;
}

.cutting-export__step-details {
  margin: 0;
}

.cutting-export__step-detail {
  display: grid;
  grid-template-columns: 1fr;
  gap: 4px;
  padding: 6px 0;
  border-bottom: 1px solid #E8E8EB;
}

.cutting-export__step-detail:last-child {
  border-bottom: none;
}

.cutting-export__step-detail dt {
  margin: 0;
  color: #000;
  font-size: 13px;
  font-weight: 700;
}

.cutting-export__step-detail dd {
  margin: 0;
  color: #454545;
  word-break: break-word;
}

.cutting-export__step-params {
  grid-column: 1 / -1;
  width: 100%;
  margin: 4px 0 0;
  border-collapse: collapse;
  table-layout: fixed;
  font-size: 11px;
}

.cutting-export__step-params th,
.cutting-export__step-params td {
  padding: 8px;
  height: 1px;
  min-height: 28px;
  border: 1px solid #CDCDCD;
  text-align: left;
  vertical-align: middle;
  word-break: break-word;
}

.cutting-export__step-params th {
  width: 34%;
  color: #979797;
  font-weight: 400;
  background: #fff;
}

.cutting-export__step-params td {
  color: #454545;
}

.cutting-export__step-params--plain {
  margin: 0;
}

.cutting-export__step-params--plain th {
  color: #000;
  font-weight: 700;
}

.cutting-export__downloads {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: flex-start;
}

.cutting-export__download-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: fit-content;
  max-width: 100%;
  padding: 8px;
  border: 1px solid #CDCDCD;
  border-radius: 4px;
  color: inherit;
  text-decoration: none;
  background: #fff;
  cursor: pointer;
}

.cutting-export__download-card--disabled {
  pointer-events: none;
  opacity: 0.7;
  cursor: default;
}

.cutting-export__download-card:hover {
  background: #f7f7f7;
}

.cutting-export__download-preview-frame {
  position: relative;
  width: 60px;
  height: 60px;
  margin-bottom: 6px;
  overflow: hidden;
  border: 1px solid #E8E8EB;
  background-color: #fff;
  background-image:
    linear-gradient(45deg, #e4e4e4 25%, transparent 25%),
    linear-gradient(-45deg, #e4e4e4 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #e4e4e4 75%),
    linear-gradient(-45deg, transparent 75%, #e4e4e4 75%);
  background-size: 8px 8px;
  background-position:
    0 0,
    0 4px,
    4px -4px,
    -4px 0;
}

.cutting-export__download-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 4px;
  font-size: 8px;
  line-height: 1.2;
  color: #979797;
  text-align: center;
}

.cutting-export__download-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 4px;
  font-size: 8px;
  line-height: 1.2;
  font-weight: 700;
  text-align: center;
  color: #454545;
}

.cutting-export__download-preview {
  display: block;
  width: 60px;
  height: 60px;
  margin: 0;
  object-fit: cover;
  background: #fff;
}

.cutting-export__download-label {
  display: block;
  width: 60px;
  color: #000;
  font-size: 10px;
  font-weight: 700;
  line-height: 1.3;
  text-transform: uppercase;
}

.cutting-export__download-file {
  display: block;
  width: 60px;
  margin-top: 2px;
  font-size: 9px;
  line-height: 1.3;
  color: #979797;
  word-break: break-all;
}

.cutting-export__uv-section {
  margin-bottom: 18px;
}

.cutting-export__uv-atlas {
  position: relative;
  width: 100%;
  margin-bottom: 12px;
  border: 1px solid #CDCDCD;
  background: #fff;
  overflow: hidden;
}

.cutting-export__uv-atlas-frame {
  position: relative;
  width: 100%;
  background: #fff;
}

.cutting-export__uv-atlas-layer {
  display: block;
  width: 100%;
  height: auto;
  object-fit: contain;
}

.cutting-export__uv-atlas-layer--hidden {
  display: none;
}

.cutting-export__uv-atlas-meta {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 6px 8px;
  border-top: 1px solid #E8E8EB;
  font-size: 10px;
}

.cutting-export__uv-layers-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.cutting-export__uv-layer-card {
  border: 1px solid #CDCDCD;
  background: #fff;
}

.cutting-export__uv-layer-card-header {
  display: flex;
  align-items: center;
  min-height: 28px;
  padding: 8px;
  border-bottom: 1px solid #E8E8EB;
  font-size: 10px;
  font-weight: 700;
  line-height: 1.2;
  text-transform: uppercase;
}

.cutting-export__uv-layer-card-body {
  padding: 8px;
  background: #fff;
}

.cutting-export__uv-layer-image {
  display: block;
  width: 100%;
  height: auto;
  object-fit: contain;
  background: #fff;
}

.cutting-export__uv-layer-file {
  margin: 6px 0 0;
  font-size: 9px;
  color: #979797;
  word-break: break-all;
}

.cutting-export__specs-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 18px;
  table-layout: fixed;
}

.cutting-export__specs-table th,
.cutting-export__specs-table td {
  border: 1px solid #CDCDCD;
  padding: 8px;
  height: 1px;
  min-height: 28px;
  vertical-align: middle;
  text-align: left;
}

.cutting-export__specs-table th {
  width: 34%;
  color: #000;
  font-weight: 700;
  background: #E8E8EB;
}

.cutting-export__specs-logos {
  margin: 0;
  padding-left: 16px;
}

.cutting-export__specs-logos li {
  margin: 0;
}

.cutting-export__articles-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  margin-bottom: 18px;
}

.cutting-export__articles-table th,
.cutting-export__articles-table td {
  border: 1px solid #CDCDCD;
  padding: 8px;
  height: 1px;
  min-height: 28px;
  text-align: center;
  vertical-align: middle;
}

.cutting-export__articles-table td {
  color: #454545;
}

.cutting-export__articles-table thead tr:first-child th {
  background: #E8E8EB;
  color: #000;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
}

.cutting-export__articles-table thead tr:nth-child(2) th {
  color: #000;
  font-weight: 700;
  background: #E8E8EB;
}

.cutting-export-pages {
  width: 794px;
}

.cutting-export-page {
  box-sizing: border-box;
  width: 794px;
  height: 1123px;
  padding: 24px 28px 32px;
  overflow: hidden;
  color: #454545;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 11px;
  line-height: 1.35;
  background: #fff;
}

.cutting-export-page__inner {
  width: 100%;
}

.cutting-export--pdf-single-page {
  height: auto;
  min-height: auto;
}
`;

export { ORDER_CUTTING_EXPORT_DOCUMENT_STYLES };
