import { CHECKOUT_CONFIG_EXPORT_FILENAME, CHECKOUT_CUTTING_EXPORT_FILENAME, CHECKOUT_ORDER_EXPORT_FILENAME } from '@constants';
import { fetchLatestOrderExportAssets } from '@shopify';
import type { shopifyOrderNodeType, uvImageEntryType } from '@shopify';
import { Container } from '@atoms';

const buildDownloadHref = (fileUrl: string, filename: string) => {
  const params = new URLSearchParams({ url: fileUrl, filename });
  return `/api/download?${params.toString()}`;
};

const parseJsonValue = (value: string): unknown => {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const buildOrderJson = (raw: shopifyOrderNodeType) =>
  JSON.stringify(
    {
      ...raw,
      metafields: raw.metafields.edges.map(({ node }) => ({
        ...node,
        value: node.type === 'json' ? parseJsonValue(node.value) : node.value,
      })),
      customAttributes: raw.customAttributes.map((attribute) => ({
        ...attribute,
        value: attribute.value?.trimStart().startsWith('[') || attribute.value?.trimStart().startsWith('{') ? parseJsonValue(attribute.value) : attribute.value,
      })),
      lineItems: raw.lineItems.edges.map(({ node }) => node),
    },
    null,
    2,
  );

const resolveUvImageFilename = (uvImage: uvImageEntryType) => {
  const pathname = uvImage.url.split('?')[0] ?? uvImage.url;
  const match = /\.([a-z0-9]+)$/i.exec(pathname);
  const extension = match ? match[1].toLowerCase() : 'png';
  return `${uvImage.label}.${extension}`;
};

const LastOrderExportPage = async () => {
  const order = await fetchLatestOrderExportAssets().catch((error: unknown) => {
    console.error('[dev/last-order-export] Failed to fetch latest order.', error);
    return null;
  });

  return (
    <Container>
      <div className="py-10 flex flex-col gap-6 max-w-[720px] mx-auto">
        <h1 className="text-xl font-semibold">Ultimo ordine — file di export</h1>

        {!order ? (
          <p className="text-sm text-gray-30">Nessun ordine trovato o impossibile contattare Shopify Admin API.</p>
        ) : (
          <>
            <div className="text-sm text-gray-30 flex flex-col gap-1">
              <span>
                Ordine <strong className="text-default">{order.name}</strong> ({order.id})
              </span>
              <span>Creato: {new Date(order.createdAt).toLocaleString('it-IT')}</span>
              <span>Stato pagamento: {order.financialStatus}</span>
            </div>

            <ul className="flex flex-col gap-2">
              {order.orderPdfUrl && (
                <li>
                  <a className="text-active underline" href={buildDownloadHref(order.orderPdfUrl, CHECKOUT_ORDER_EXPORT_FILENAME)}>
                    Conferma ordine (PDF)
                  </a>
                </li>
              )}
              {order.cuttingPdfUrl && (
                <li>
                  <a className="text-active underline" href={buildDownloadHref(order.cuttingPdfUrl, CHECKOUT_CUTTING_EXPORT_FILENAME)}>
                    Modulo tessitura (PDF)
                  </a>
                </li>
              )}
              {order.configUrl && (
                <li>
                  <a className="text-active underline" href={buildDownloadHref(order.configUrl, CHECKOUT_CONFIG_EXPORT_FILENAME)}>
                    Config (JSON)
                  </a>
                </li>
              )}
              {order.uvImages.map((uvImage, index) => (
                <li key={`${uvImage.cartItemId}-${uvImage.label}-${index}`}>
                  <a className="text-active underline" href={buildDownloadHref(uvImage.url, resolveUvImageFilename(uvImage))}>
                    {uvImage.label} — {uvImage.cartItemId}
                  </a>
                </li>
              ))}
            </ul>

            {!order.orderPdfUrl && !order.cuttingPdfUrl && !order.configUrl && order.uvImages.length === 0 && (
              <p className="text-sm text-gray-30">Nessun file di export trovato per questo ordine.</p>
            )}

            <section className="flex flex-col gap-3">
              <h2 className="text-base font-semibold">Ordine (JSON)</h2>
              <pre className="text-xs text-gray-30 whitespace-pre-wrap break-all border border-gray-20 rounded p-3">{buildOrderJson(order.raw)}</pre>
            </section>
          </>
        )}
      </div>
    </Container>
  );
};

export { LastOrderExportPage };
