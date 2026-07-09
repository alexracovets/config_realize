/* eslint-disable jsx-a11y/alt-text -- @react-pdf/renderer's Image is not a DOM element and has no alt prop */
import { Document, Image, Link, Page, StyleSheet, Text, View } from '@react-pdf/renderer';

import type {
  orderCuttingExportConfigurationStepType,
  orderCuttingExportDownloadFileType,
  orderCuttingExportProductType,
  orderCuttingExportType,
} from '@types';

type orderCuttingExportPdfImagesType = {
  /** Embeddable PNG data URLs keyed by `${cartItemId}:${label}` (composed UV textures) or raw src. */
  downloadPreviewByKey: Map<string, string | null>;
  /** Public https URLs (already uploaded to Shopify Files) keyed by `${cartItemId}:${label}` — used as PDF link targets. */
  downloadLinkByKey: Map<string, string>;
};

type orderCuttingExportPdfDocumentPropsType = {
  exportData: orderCuttingExportType;
  images: orderCuttingExportPdfImagesType;
};

const COLOR_TEXT = '#000000';
const COLOR_MUTED = '#666666';
const COLOR_BORDER = '#d9d9d9';
const COLOR_HEAD_BG = '#f2f2f2';
const MIN_ARTICLE_ROWS = 4;

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: COLOR_TEXT,
    paddingTop: 28,
    paddingHorizontal: 27,
    paddingBottom: 40,
    backgroundColor: '#ffffff',
  },
  title: { fontSize: 16, fontFamily: 'Helvetica-Bold', marginBottom: 4 },
  subtitle: { fontSize: 9, color: COLOR_MUTED, marginBottom: 14 },
  customerTable: { borderWidth: 0.75, borderColor: COLOR_BORDER, marginBottom: 16 },
  customerRow: { flexDirection: 'row' },
  customerTh: {
    width: '22%',
    backgroundColor: COLOR_HEAD_BG,
    borderWidth: 0.75,
    borderColor: COLOR_BORDER,
    padding: 5,
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
  },
  customerTd: { width: '28%', borderWidth: 0.75, borderColor: COLOR_BORDER, padding: 5, fontSize: 8 },
  articlesTitleCell: {
    backgroundColor: COLOR_HEAD_BG,
    borderWidth: 0.75,
    borderColor: COLOR_BORDER,
    padding: 5,
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    textAlign: 'center',
  },
  articlesRow: { flexDirection: 'row' },
  articlesTh: {
    backgroundColor: COLOR_HEAD_BG,
    borderWidth: 0.75,
    borderColor: COLOR_BORDER,
    padding: 5,
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
    textAlign: 'center',
  },
  articlesTd: { borderWidth: 0.75, borderColor: COLOR_BORDER, padding: 5, fontSize: 8, textAlign: 'center' },
  articlesTable: { marginBottom: 20 },
  product: { marginBottom: 18 },
  productHeader: { marginBottom: 8 },
  productTitle: { fontSize: 12, fontFamily: 'Helvetica-Bold' },
  productMeta: { fontSize: 8, color: COLOR_MUTED, marginTop: 2 },
  step: { borderWidth: 0.75, borderColor: COLOR_BORDER, borderRadius: 3, padding: 8, marginBottom: 8 },
  stepHeader: { flexDirection: 'row', gap: 4, marginBottom: 6 },
  stepIndex: { fontFamily: 'Helvetica-Bold', fontSize: 9 },
  stepTitle: { fontFamily: 'Helvetica-Bold', fontSize: 9 },
  stepEmpty: { fontSize: 8, color: COLOR_MUTED },
  detail: { marginBottom: 6 },
  detailLabel: { fontFamily: 'Helvetica-Bold', fontSize: 8, marginBottom: 2 },
  detailValue: { fontSize: 8 },
  paramsTable: { borderWidth: 0.75, borderColor: COLOR_BORDER, marginTop: 2 },
  paramRow: { flexDirection: 'row' },
  paramTh: {
    width: '35%',
    backgroundColor: COLOR_HEAD_BG,
    borderWidth: 0.75,
    borderColor: COLOR_BORDER,
    padding: 4,
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
  },
  paramTd: { width: '65%', borderWidth: 0.75, borderColor: COLOR_BORDER, padding: 4, fontSize: 7.5 },
  downloads: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 },
  downloadCard: {
    width: 76,
    borderWidth: 0.75,
    borderColor: COLOR_BORDER,
    borderRadius: 3,
    padding: 6,
    alignItems: 'center',
    textDecoration: 'none',
    color: COLOR_TEXT,
  },
  downloadPreviewFrame: {
    width: 45,
    height: 45,
    borderWidth: 0.75,
    borderColor: COLOR_BORDER,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  downloadPreview: { width: 43, height: 43, objectFit: 'contain' },
  downloadPlaceholder: { fontSize: 7, color: COLOR_MUTED, textAlign: 'center' },
  downloadLabel: { fontSize: 8, fontFamily: 'Helvetica-Bold', textAlign: 'center' },
  downloadFile: { fontSize: 7, color: COLOR_MUTED, textAlign: 'center', marginTop: 2 },
  pageNumber: { position: 'absolute', right: 27, bottom: 14, fontSize: 7.5, color: COLOR_MUTED, textAlign: 'right' },
});

const buildDownloadPreviewKey = (cartItemId: string, label: string) => `${cartItemId}:${label}`;

const isLinkableUrl = (url: string | undefined): url is string => Boolean(url && /^https?:/i.test(url));

const DownloadCard = ({
  cartItemId,
  file,
  images,
}: {
  cartItemId: string;
  file: orderCuttingExportDownloadFileType;
  images: orderCuttingExportPdfImagesType;
}) => {
  const previewKey = buildDownloadPreviewKey(cartItemId, file.label);
  const previewSrc = images.downloadPreviewByKey.get(previewKey) ?? images.downloadPreviewByKey.get(file.previewSrc ?? '') ?? null;
  const linkUrl = images.downloadLinkByKey.get(previewKey) ?? (isLinkableUrl(file.downloadUrl) ? file.downloadUrl : null);

  const cardContent = (
    <>
      <View style={styles.downloadPreviewFrame}>
        {previewSrc ? <Image src={previewSrc} style={styles.downloadPreview} /> : <Text style={styles.downloadPlaceholder}>{file.label}</Text>}
      </View>
      <Text style={styles.downloadLabel}>{file.label}</Text>
      <Text style={styles.downloadFile}>{file.fileName}</Text>
    </>
  );

  if (linkUrl) {
    return (
      <Link src={linkUrl} style={styles.downloadCard} wrap={false}>
        {cardContent}
      </Link>
    );
  }

  return (
    <View style={styles.downloadCard} wrap={false}>
      {cardContent}
    </View>
  );
};

const StepDetails = ({ step }: { step: orderCuttingExportConfigurationStepType }) => {
  if (!step.details.length) return null;

  const isPlain = step.details.every((detail) => !detail.params?.length);

  if (isPlain) {
    return (
      <View style={styles.paramsTable}>
        {step.details.map((detail) => (
          <View key={`${step.key}-${detail.label}`} style={styles.paramRow}>
            <Text style={styles.paramTh}>{detail.label}</Text>
            <Text style={styles.paramTd}>{detail.value}</Text>
          </View>
        ))}
      </View>
    );
  }

  return (
    <View>
      {step.details.map((detail) => (
        <View key={`${step.key}-${detail.label}`} style={styles.detail}>
          <Text style={styles.detailLabel}>{detail.label}</Text>
          {detail.params?.length ? (
            <View style={styles.paramsTable}>
              {detail.params.map((param) => (
                <View key={`${step.key}-${detail.label}-${param.label}`} style={styles.paramRow}>
                  <Text style={styles.paramTh}>{param.label}</Text>
                  <Text style={styles.paramTd}>{param.value}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.detailValue}>{detail.value}</Text>
          )}
        </View>
      ))}
    </View>
  );
};

const ProductSection = ({ product, images }: { product: orderCuttingExportProductType; images: orderCuttingExportPdfImagesType }) => (
  <View style={styles.product}>
    <View style={styles.productHeader} wrap={false}>
      <Text style={styles.productTitle}>{product.productTitle}</Text>
      <Text style={styles.productMeta}>
        Modello: {product.modelLabel} · Print atlas: {product.printAtlas.width}×{product.printAtlas.height}px
      </Text>
    </View>

    {product.steps.map((step) => (
      <View key={`${product.cartItemId}-${step.key}`} style={styles.step} wrap={false}>
        <View style={styles.stepHeader}>
          <Text style={styles.stepIndex}>{step.step}.</Text>
          <Text style={styles.stepTitle}>{step.title}</Text>
        </View>

        {step.isConfigured ? (
          <>
            <StepDetails step={step} />
            {step.downloadFiles.length > 0 && (
              <View style={styles.downloads}>
                {step.downloadFiles.map((file) => (
                  <DownloadCard key={file.key} cartItemId={product.cartItemId} file={file} images={images} />
                ))}
              </View>
            )}
          </>
        ) : (
          <Text style={styles.stepEmpty}>{step.emptyMessage}</Text>
        )}
      </View>
    ))}
  </View>
);

const OrderCuttingExportPdfDocument = ({ exportData, images }: orderCuttingExportPdfDocumentPropsType) => {
  const { customer, articles, products } = exportData;
  const emptyArticleRows = Math.max(0, MIN_ARTICLE_ROWS - articles.length);

  const customerRows: Array<[string, string, string, string]> = [
    ["Numero d'ordine", exportData.orderNumber, 'Data ordine', exportData.orderDate],
    ['Azienda', customer.company, 'Partita IVA o cod. fiscale', customer.vatOrTaxCode],
    ['Nome', customer.firstName, 'Cognome', customer.lastName],
    ['Indirizzo', customer.address, 'Località', customer.city],
    ['Provincia', customer.province, 'CAP', customer.postalCode],
    ['E-mail', customer.email, 'PEC', customer.pec],
  ];

  return (
    <Document title={`Modulo ordine ${exportData.orderNumber}`.trim()} producer="Realize" creator="Realize">
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Modulo ordine cliente</Text>
        <Text style={styles.subtitle}>Dati generali del cliente privato o società sportiva</Text>

        <View style={styles.customerTable} wrap={false}>
          {customerRows.map(([labelA, valueA, labelB, valueB]) => (
            <View key={labelA} style={styles.customerRow}>
              <Text style={styles.customerTh}>{labelA}</Text>
              <Text style={styles.customerTd}>{valueA || ' '}</Text>
              <Text style={styles.customerTh}>{labelB}</Text>
              <Text style={styles.customerTd}>{valueB || ' '}</Text>
            </View>
          ))}
        </View>

        <View style={styles.articlesTable}>
          <Text style={styles.articlesTitleCell}>Articoli ordine</Text>
          <View style={styles.articlesRow} wrap={false}>
            {['Modello', 'Taglia', 'PZ', 'Nome maglia', 'Numero'].map((header, index) => (
              <Text key={header} style={[styles.articlesTh, { width: index === 0 ? '28%' : '18%' }]}>
                {header}
              </Text>
            ))}
          </View>
          {articles.map((article, index) => (
            <View key={`${article.modelLabel}-${article.size}-${index}`} style={styles.articlesRow} wrap={false}>
              {[article.modelLabel, article.size, String(article.quantity), article.jerseyName, article.number].map((value, cellIndex) => (
                <Text key={cellIndex} style={[styles.articlesTd, { width: cellIndex === 0 ? '28%' : '18%' }]}>
                  {value}
                </Text>
              ))}
            </View>
          ))}
          {Array.from({ length: emptyArticleRows }).map((_, index) => (
            <View key={`empty-row-${index}`} style={styles.articlesRow} wrap={false}>
              {Array.from({ length: 5 }).map((__, cellIndex) => (
                <Text key={cellIndex} style={[styles.articlesTd, { width: cellIndex === 0 ? '28%' : '18%' }]}>
                  {' '}
                </Text>
              ))}
            </View>
          ))}
        </View>

        {products.map((product) => (
          <ProductSection key={product.cartItemId} product={product} images={images} />
        ))}

        <Text style={styles.pageNumber} fixed render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
      </Page>
    </Document>
  );
};

export { buildDownloadPreviewKey, OrderCuttingExportPdfDocument };
export type { orderCuttingExportPdfDocumentPropsType, orderCuttingExportPdfImagesType };
