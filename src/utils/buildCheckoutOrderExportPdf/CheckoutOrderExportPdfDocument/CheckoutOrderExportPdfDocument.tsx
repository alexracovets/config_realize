import { Document, Image, Page, Path, StyleSheet, Svg, Text, View } from '@react-pdf/renderer';

import type { checkoutOrderExportLineType, checkoutOrderExportType } from '@types';
import {
  CHECKOUT_ORDER_EXPORT_BILLING_TITLE,
  CHECKOUT_ORDER_EXPORT_COPYRIGHT_PREFIX,
  CHECKOUT_ORDER_EXPORT_EMAIL,
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
import { priceFormat } from '@utils/priceFormat';

type checkoutOrderExportPdfImagesType = {

  logoSrc: string | null;

  previewBySrc: Map<string, string | null>;
};

type checkoutOrderExportPdfDocumentPropsType = {
  exportData: checkoutOrderExportType;
  images: checkoutOrderExportPdfImagesType;
};

const COLOR_TEXT = '#000000';
const COLOR_MUTED = '#888888';
const COLOR_FOOTER = '#454545';
const COLOR_BORDER = '#e0e0e0';
const COLOR_TABLE_HEAD_BG = '#f2f2f2';

const TABLE_COLUMN_WIDTHS = ['11%', '9%', '16%', '9%', '8%', '13%', '14%', '20%'] as const;
const FOOTER_RESERVED_HEIGHT = 78;

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: COLOR_TEXT,
    paddingTop: 28,
    paddingHorizontal: 27,
    paddingBottom: FOOTER_RESERVED_HEIGHT,
    backgroundColor: '#ffffff',
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  logo: { width: 127, height: 30, objectFit: 'contain' },
  logoFallback: { fontSize: 14, fontFamily: 'Helvetica-Bold' },
  contact: { textAlign: 'right', fontSize: 8, color: COLOR_MUTED, lineHeight: 1.5 },
  divider: { borderTopWidth: 1, borderTopColor: COLOR_BORDER, marginVertical: 8 },
  info: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 21, marginTop: 4 },
  customer: { flexBasis: '50%', gap: 12 },
  sectionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, lineHeight: 1.5 },
  sectionLabel: { color: COLOR_MUTED },
  sectionValue: { flexShrink: 1 },
  titleBlock: { flexBasis: '45%', alignItems: 'flex-end' },
  title: { fontSize: 21, fontFamily: 'Helvetica-Bold', marginBottom: 15 },
  metaGrid: { flexDirection: 'row', gap: 24 },
  metaLabel: { color: COLOR_MUTED, marginBottom: 3 },
  tableHeadRow: { flexDirection: 'row', backgroundColor: COLOR_TABLE_HEAD_BG },
  tableRow: { flexDirection: 'row' },
  tableHeadCell: {
    borderWidth: 0.75,
    borderColor: COLOR_BORDER,
    paddingVertical: 6,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tableHeadText: { fontSize: 8, fontFamily: 'Helvetica-Bold', textAlign: 'center' },
  tableCell: {
    borderWidth: 0.75,
    borderColor: COLOR_BORDER,
    paddingVertical: 6,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tableCellText: { fontSize: 8, textAlign: 'center' },
  preview: { width: 30, height: 30, objectFit: 'contain' },
  totalsDivider: { borderTopWidth: 1, borderTopColor: COLOR_BORDER, marginTop: 18, marginBottom: 18 },
  totals: { alignItems: 'flex-end' },
  totalsRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginBottom: 3, alignItems: 'flex-end' },
  totalsLabel: { color: COLOR_MUTED },
  totalsValue: { textAlign: 'right' },
  totalsGrandRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 9, marginBottom: 3, alignItems: 'flex-end' },
  totalsGrandLabel: { fontSize: 12, fontFamily: 'Helvetica-Bold' },
  totalsGrandValue: { fontSize: 18, fontFamily: 'Helvetica-Bold' },
  totalsNote: { fontSize: 7.5, color: COLOR_MUTED, textAlign: 'right', marginTop: 2 },
  footer: { position: 'absolute', left: 27, right: 27, bottom: 18 },
  trustList: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  trustItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  trustLabel: { fontSize: 8, color: COLOR_FOOTER },
  footerDivider: { borderTopWidth: 1, borderTopColor: COLOR_BORDER, marginTop: 12, marginBottom: 8 },
  copyright: { fontSize: 7.5, color: COLOR_MUTED, textAlign: 'center' },
  pageNumber: { position: 'absolute', right: 27, bottom: 8, fontSize: 7.5, color: COLOR_MUTED, textAlign: 'right' },
});

const TRUST_ICON_PATHS: Record<(typeof CHECKOUT_SUMMARY_TRUST_ITEMS)[number]['icon'], string[]> = {
  shirt: [
    'M19.2674 4.92188L15.2229 2.71407C15.1543 2.67603 15.0771 2.65613 14.9987 2.65625H12.4987C12.3744 2.65625 12.2551 2.70564 12.1672 2.79355C12.0793 2.88145 12.0299 3.00068 12.0299 3.125C12.0299 3.66372 11.8159 4.18038 11.435 4.56131C11.054 4.94225 10.5374 5.15625 9.99867 5.15625C9.45995 5.15625 8.94329 4.94225 8.56236 4.56131C8.18143 4.18038 7.96742 3.66372 7.96742 3.125C7.96742 3.00068 7.91803 2.88145 7.83013 2.79355C7.74222 2.70564 7.62299 2.65625 7.49867 2.65625H4.99867C4.91996 2.656 4.8425 2.6759 4.77367 2.71407L0.72992 4.92188C0.478335 5.05465 0.289581 5.28167 0.204955 5.55326C0.12033 5.82486 0.146722 6.11891 0.278358 6.3711L1.78461 9.24688C1.8809 9.42837 2.02511 9.57997 2.20156 9.68521C2.37801 9.79045 2.57994 9.84528 2.78539 9.84375H4.52992V16.25C4.52992 16.5401 4.64515 16.8183 4.85027 17.0234C5.05539 17.2285 5.33359 17.3438 5.62367 17.3438H14.3737C14.6638 17.3438 14.942 17.2285 15.1471 17.0234C15.3522 16.8183 15.4674 16.5401 15.4674 16.25V9.84375H17.2127C17.4182 9.84528 17.6201 9.79045 17.7966 9.68521C17.973 9.57997 18.1172 9.42837 18.2135 9.24688L19.7198 6.3711C19.8513 6.11882 19.8776 5.82469 19.7928 5.55308C19.7081 5.28148 19.5191 5.05452 19.2674 4.92188ZM2.78305 8.90625C2.74875 8.90743 2.71478 8.89926 2.68478 8.88261C2.65477 8.86596 2.62987 8.84145 2.61273 8.81172L1.10883 5.9375C1.10035 5.92029 1.09544 5.90153 1.09441 5.88237C1.09337 5.86321 1.09622 5.84404 1.10279 5.82601C1.10936 5.80798 1.11951 5.79147 1.13263 5.77746C1.14575 5.76346 1.16157 5.75226 1.17914 5.74453L4.52992 3.91485V8.90625H2.78305ZM14.5299 16.25C14.5299 16.2914 14.5135 16.3312 14.4842 16.3605C14.4549 16.3898 14.4151 16.4063 14.3737 16.4063H5.62367C5.58223 16.4063 5.54249 16.3898 5.51318 16.3605C5.48388 16.3312 5.46742 16.2914 5.46742 16.25V3.59375H7.06742C7.18127 4.28864 7.53841 4.92044 8.07507 5.37632C8.61173 5.83221 9.29296 6.08249 9.99711 6.08249C10.7013 6.08249 11.3825 5.83221 11.9191 5.37632C12.4558 4.92044 12.8129 4.28864 12.9268 3.59375H14.5299V16.25ZM18.8893 5.9375L17.383 8.8125C17.3659 8.84223 17.341 8.86674 17.311 8.88339C17.281 8.90004 17.247 8.90822 17.2127 8.90703H15.4674V3.91485L18.819 5.74297C18.8366 5.75085 18.8525 5.76221 18.8656 5.77637C18.8787 5.79054 18.8888 5.80721 18.8953 5.82539C18.9018 5.84356 18.9045 5.86287 18.9034 5.88214C18.9022 5.90141 18.8972 5.92024 18.8885 5.9375H18.8893Z',
  ],
  shieldCheck: [
    'M8.75 10.3688L7.13125 8.75L6.25 9.63125L8.75 12.1312L13.75 7.13125L12.8688 6.25L8.75 10.3688Z',
    'M10 18.75L6.14001 16.6919C5.0395 16.1066 4.11919 15.2325 3.4779 14.1637C2.83661 13.0948 2.49854 11.8715 2.5 10.625V2.5C2.5 2.16848 2.6317 1.85054 2.86612 1.61612C3.10054 1.3817 3.41848 1.25 3.75 1.25H16.25C16.5815 1.25 16.8995 1.3817 17.1339 1.61612C17.3683 1.85054 17.5 2.16848 17.5 2.5V10.625C17.5015 11.8715 17.1634 13.0948 16.5221 14.1637C15.8808 15.2325 14.9605 16.1066 13.86 16.6919L10 18.75ZM3.75 2.5V10.625C3.74931 11.6448 4.02618 12.6456 4.55093 13.52C5.07568 14.3945 5.82853 15.1096 6.72875 15.5887L10 17.3331L13.2713 15.5894C14.1716 15.1102 14.9245 14.3949 15.4492 13.5204C15.974 12.6458 16.2508 11.6449 16.25 10.625V2.5H3.75Z',
  ],
  truck: [
    'M3.19863 15.295C2.77641 14.8711 2.5653 14.3564 2.5653 13.7508H2.08447C1.89391 13.7508 1.73419 13.6864 1.6053 13.5575C1.47641 13.4286 1.41169 13.2686 1.41113 13.0775V5.51415C1.41113 5.13026 1.53974 4.80998 1.79697 4.55331C2.05419 4.29665 2.37447 4.16804 2.7578 4.16748H12.437C12.8075 4.16748 13.1245 4.29942 13.3878 4.56331C13.6511 4.8272 13.7831 5.14387 13.7836 5.51331V7.17998H15.0336C15.2464 7.17998 15.4481 7.22776 15.6386 7.32331C15.8297 7.41887 15.987 7.55081 16.1103 7.71915L18.4561 10.8775C18.5011 10.9336 18.5347 10.9953 18.557 11.0625C18.5792 11.1297 18.5903 11.2028 18.5903 11.2816V13.0775C18.5903 13.2686 18.5261 13.4286 18.3978 13.5575C18.2695 13.6864 18.1095 13.7508 17.9178 13.7508H17.2445C17.2445 14.3564 17.0322 14.8711 16.6078 15.295C16.1834 15.7189 15.6681 15.9305 15.062 15.93C14.4559 15.9294 13.9414 15.7178 13.5186 15.295C13.0959 14.8722 12.8847 14.3575 12.8853 13.7508H6.9253C6.9253 14.3597 6.71308 14.8753 6.28863 15.2975C5.86419 15.7197 5.34863 15.9308 4.74197 15.9308C4.1353 15.9308 3.62086 15.7189 3.19863 15.295ZM5.69947 14.705C5.96058 14.4439 6.09113 14.1258 6.09113 13.7508C6.09113 13.3758 5.96058 13.0578 5.69947 12.7966C5.43835 12.5355 5.1203 12.405 4.7453 12.405C4.3703 12.405 4.05224 12.5355 3.79113 12.7966C3.53002 13.0578 3.39947 13.3758 3.39947 13.7508C3.39947 14.1258 3.53002 14.4439 3.79113 14.705C4.05224 14.9661 4.3703 15.0966 4.7453 15.0966C5.1203 15.0966 5.43863 14.9661 5.7003 14.705M2.24447 12.9175H2.7828C2.90169 12.5497 3.14336 12.2336 3.5078 11.9691C3.87224 11.7047 4.28447 11.5719 4.74447 11.5708C5.18336 11.5708 5.59058 11.7008 5.96613 11.9608C6.34113 12.2203 6.5878 12.5391 6.70613 12.9175H12.9503V5.51415C12.9503 5.36415 12.902 5.24109 12.8053 5.14498C12.7092 5.04887 12.5864 5.00081 12.437 5.00081H2.7578C2.62947 5.00081 2.51197 5.05415 2.4053 5.16081C2.29808 5.26804 2.24447 5.38581 2.24447 5.51415V12.9175ZM16.0195 14.705C16.2806 14.4439 16.4111 14.1258 16.4111 13.7508C16.4111 13.3758 16.2806 13.0578 16.0195 12.7966C15.7584 12.5355 15.4403 12.405 15.0653 12.405C14.6903 12.405 14.3722 12.5355 14.1111 12.7966C13.85 13.0578 13.7195 13.3758 13.7195 13.7508C13.7195 14.1258 13.85 14.4439 14.1111 14.705C14.3722 14.9661 14.6903 15.0966 15.0653 15.0966C15.4403 15.0966 15.7584 14.9661 16.0195 14.705ZM13.7828 11.2508H17.7095L15.4178 8.22248C15.3645 8.15804 15.3031 8.1072 15.2336 8.06998C15.1642 8.03276 15.0867 8.01415 15.0011 8.01415H13.7836L13.7828 11.2508Z',
  ],
  star: [
    'M5.84326 16.8263L9.78076 14.4513L13.7183 16.8575L12.687 12.3575L16.1558 9.3575L11.5933 8.95125L9.78076 4.70125L7.96826 8.92L3.40576 9.32625L6.87451 12.3575L5.84326 16.8263ZM9.78076 15.9225L5.24326 18.6625C5.10993 18.7283 4.98618 18.755 4.87201 18.7425C4.75868 18.7292 4.64826 18.69 4.54076 18.625C4.43243 18.5583 4.35076 18.4642 4.29576 18.3425C4.24076 18.2208 4.23576 18.0879 4.28076 17.9437L5.48826 12.8063L1.49451 9.34375C1.38201 9.25208 1.30785 9.1425 1.27201 9.015C1.23618 8.8875 1.2441 8.76542 1.29576 8.64875C1.34743 8.53208 1.41618 8.43625 1.50201 8.36125C1.58868 8.28875 1.70535 8.23958 1.85201 8.21375L7.12201 7.75375L9.17701 2.88875C9.23368 2.75125 9.31535 2.65208 9.42201 2.59125C9.52868 2.53042 9.64826 2.5 9.78076 2.5C9.91326 2.5 10.0333 2.53042 10.1408 2.59125C10.2483 2.65208 10.3295 2.75125 10.3845 2.88875L12.4395 7.75375L17.7083 8.21375C17.8558 8.23875 17.9728 8.28833 18.0595 8.3625C18.1462 8.43583 18.2153 8.53125 18.267 8.64875C18.3178 8.76542 18.3253 8.8875 18.2895 9.015C18.2537 9.1425 18.1795 9.25208 18.067 9.34375L14.0733 12.8063L15.2808 17.9437C15.3274 18.0862 15.3228 18.2188 15.267 18.3413C15.2112 18.4638 15.1291 18.5579 15.0208 18.6238C14.9141 18.6904 14.8037 18.73 14.6895 18.7425C14.5762 18.755 14.4528 18.7283 14.3195 18.6625L9.78076 15.9225Z',
  ],
};

const TABLE_HEADERS = ['Modello', 'Taglia', 'Nome', 'Numero', 'QTY', CHECKOUT_ORDER_EXPORT_VAT_LABEL, 'Prezzo', 'Prezzo Totale'];

const formatShippingAddressLine = (shippingAddress: checkoutOrderExportType['shippingAddress']) =>
  `${shippingAddress.street}, ${shippingAddress.postalCode} ${shippingAddress.city}, ${shippingAddress.country}`;

const TrustIcon = ({ icon }: { icon: (typeof CHECKOUT_SUMMARY_TRUST_ITEMS)[number]['icon'] }) => (
  <Svg width={9} height={9} viewBox="0 0 20 20">
    {TRUST_ICON_PATHS[icon].map((path) => (
      <Path key={path.slice(0, 24)} d={path} fill={COLOR_FOOTER} />
    ))}
  </Svg>
);

const OrderLineRow = ({ line, previewSrc }: { line: checkoutOrderExportLineType; previewSrc: string | null }) => (
  <View style={styles.tableRow} wrap={false}>
    <View style={[styles.tableCell, { width: TABLE_COLUMN_WIDTHS[0] }]}>
      {previewSrc ? <Image src={previewSrc} style={styles.preview} /> : <View style={styles.preview} />}
    </View>
    {[
      line.size,
      line.name,
      line.number,
      String(line.quantity),
      priceFormat(line.vatAmount),
      priceFormat(line.unitPriceGross),
      priceFormat(line.lineTotalGross),
    ].map((value, cellIndex) => (
      <View key={`${cellIndex}-${value}`} style={[styles.tableCell, { width: TABLE_COLUMN_WIDTHS[cellIndex + 1] }]}>
        <Text style={styles.tableCellText}>{value}</Text>
      </View>
    ))}
  </View>
);

const CheckoutOrderExportPdfDocument = ({ exportData, images }: checkoutOrderExportPdfDocumentPropsType) => {
  const { recipient, shippingAddress, lines } = exportData;
  const currentYear = new Date().getFullYear();

  return (
    <Document title={`${CHECKOUT_ORDER_EXPORT_TITLE} ${exportData.orderNumber}`} producer="Realize" creator="Realize">
      <Page size="A4" style={styles.page}>
        <View>
          <View style={styles.headerTop}>
            {images.logoSrc ? <Image src={images.logoSrc} style={styles.logo} /> : <Text style={styles.logoFallback}>Realize You</Text>}
            <View style={styles.contact}>
              <Text>{CHECKOUT_ORDER_EXPORT_WEBSITE}</Text>
              <Text>{CHECKOUT_ORDER_EXPORT_EMAIL}</Text>
            </View>
          </View>
          <View style={styles.divider} />
        </View>

        <View style={styles.info}>
          <View style={styles.customer}>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionLabel}>{CHECKOUT_ORDER_EXPORT_RECIPIENT_TITLE}:</Text>
              <Text style={styles.sectionValue}>
                {recipient.name} {recipient.email} {recipient.phone}
              </Text>
            </View>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionLabel}>{CHECKOUT_ORDER_EXPORT_SHIPPING_TITLE}:</Text>
              <Text style={styles.sectionValue}>{formatShippingAddressLine(shippingAddress)}</Text>
            </View>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionLabel}>{CHECKOUT_ORDER_EXPORT_BILLING_TITLE}:</Text>
              <Text style={styles.sectionValue}>{exportData.billingNote}</Text>
            </View>
          </View>

          <View style={styles.titleBlock}>
            <Text style={styles.title}>{CHECKOUT_ORDER_EXPORT_TITLE}</Text>
            <View style={styles.metaGrid}>
              <View>
                <Text style={styles.metaLabel}>{CHECKOUT_ORDER_EXPORT_ORDER_DATE_LABEL}</Text>
                <Text>{exportData.orderDate}</Text>
              </View>
              <View>
                <Text style={styles.metaLabel}>{CHECKOUT_ORDER_EXPORT_ORDER_NUMBER_LABEL}</Text>
                <Text>{exportData.orderNumber}</Text>
              </View>
            </View>
          </View>
        </View>

        <View>
          <View style={styles.tableHeadRow} wrap={false}>
            {TABLE_HEADERS.map((header, index) => (
              <View key={header} style={[styles.tableHeadCell, { width: TABLE_COLUMN_WIDTHS[index] }]}>
                <Text style={styles.tableHeadText}>{header}</Text>
              </View>
            ))}
          </View>
          {lines.map((line, index) => (
            <OrderLineRow
              key={`${line.modelName}-${line.size}-${index}`}
              line={line}
              previewSrc={line.previewSrc ? (images.previewBySrc.get(line.previewSrc) ?? null) : null}
            />
          ))}
        </View>

        <View style={styles.totalsDivider} />

        <View style={styles.totals} wrap={false}>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Subtotale</Text>
            <Text style={styles.totalsValue}>{priceFormat(exportData.subtotal)}</Text>
          </View>
          {exportData.discountAmount > 0 && (
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Sconto</Text>
              <Text style={styles.totalsValue}>-{priceFormat(exportData.discountAmount)}</Text>
            </View>
          )}
          {exportData.shippingCost > 0 && (
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Spedizione</Text>
              <Text style={styles.totalsValue}>{priceFormat(exportData.shippingCost)}</Text>
            </View>
          )}
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>{CHECKOUT_ORDER_EXPORT_VAT_LABEL}</Text>
            <Text style={styles.totalsValue}>{priceFormat(exportData.vatTotal)}</Text>
          </View>
          <View style={styles.totalsGrandRow}>
            <Text style={styles.totalsGrandLabel}>Prezzo Totale</Text>
            <Text style={styles.totalsGrandValue}>{priceFormat(exportData.grandTotal)}</Text>
          </View>
          <Text style={styles.totalsNote}>{CHECKOUT_ORDER_EXPORT_VAT_INCLUDED_LABEL}</Text>
        </View>

        <View style={styles.footer} fixed>
          <View style={styles.trustList}>
            {CHECKOUT_SUMMARY_TRUST_ITEMS.map(({ icon, label }) => (
              <View key={label} style={styles.trustItem}>
                <TrustIcon icon={icon} />
                <Text style={styles.trustLabel}>{label}</Text>
              </View>
            ))}
          </View>
          <View style={styles.footerDivider} />
          <Text style={styles.copyright}>
            {CHECKOUT_ORDER_EXPORT_COPYRIGHT_PREFIX} Â© {currentYear} Â· {CHECKOUT_ORDER_EXPORT_WEBSITE} Â· {CHECKOUT_ORDER_EXPORT_EMAIL}
          </Text>
        </View>
        <Text style={styles.pageNumber} fixed render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
      </Page>
    </Document>
  );
};

export { CheckoutOrderExportPdfDocument };
export type { checkoutOrderExportPdfDocumentPropsType, checkoutOrderExportPdfImagesType };
