import { expect, test } from '@playwright/test';

const CHECKOUT_ROUTE = '/checkout';

const ORDER_EXPORT_FIXTURE = {
  product: {
    modelId: 'baggio_calcio' as const,
    collectionHandle: 'completo-gara-calcio',
    slug: 'baggio_calcio',
    name: 'Maglia E-Sports',
    price: 73.51,
  },
  rows: [
    { size: 'L', name: 'Player', number: '10', testoTexts: ['Testo'], quantity: 1 },
    { size: 'XL', name: 'Player', number: '10', testoTexts: [] as string[], quantity: 1 },
    { size: 'M', name: 'Player', number: '10', testoTexts: [] as string[], quantity: 1 },
    { size: 'L', name: 'Player', number: '10', testoTexts: [] as string[], quantity: 1 },
  ],
  previewSrc: '/models/baggio_calcio/designs/logos.webp',
  orderMeta: {
    orderNumber: '#1234567890',
    orderDate: '21 maggio 2026',
  },
};

const formatItalianPrice = (value: number) => `${new Intl.NumberFormat('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)}€`;

const calcVatFromGross = (gross: number) => (gross * 0.22) / 1.22;

const waitForCheckoutE2e = async (page: import('@playwright/test').Page) => {
  await page.waitForFunction(() => Boolean(window.__checkoutE2e?.seedOrderExportFixture), undefined, { timeout: 30_000 });
};

const seedCheckoutOrderExport = async (page: import('@playwright/test').Page) => {
  await page.evaluate((fixture) => {
    window.__checkoutE2e?.seedOrderExportFixture(fixture);
  }, ORDER_EXPORT_FIXTURE);
  await expect(page.getByTestId('checkout-order-export-document')).toContainText(ORDER_EXPORT_FIXTURE.orderMeta.orderDate);
};

test.describe('checkout order export', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(CHECKOUT_ROUTE, { waitUntil: 'networkidle' });
    await waitForCheckoutE2e(page);
    await seedCheckoutOrderExport(page);
  });

  test('renders the Realize logo from svg and the order confirmation layout', async ({ page }) => {
    const documentRoot = page.getByTestId('checkout-order-export-document');

    await expect(documentRoot.getByText("Conferma d'ordine")).toBeAttached();
    await expect(page.getByTestId('checkout-order-export-logo')).toHaveAttribute('src', '/svg/logo_you.svg');

    for (const header of ['Modello', 'Taglia', 'Nome', 'Numero', 'QTY', 'IVA 22%', 'Prezzo Totale', 'Prezzo']) {
      await expect(documentRoot.locator('th').getByText(header, { exact: true })).toBeAttached();
    }

    await expect(documentRoot.getByText('Prodotti 100% Made in Italy')).toBeAttached();
    await expect(documentRoot.locator('.order-export__trust-item').first().locator('svg.order-export__trust-icon')).toBeVisible();
    await expect(documentRoot.locator('.order-export__contact').getByText('www.realize.com', { exact: true })).toBeAttached();
    await expect(page.getByTestId('checkout-order-export-header-divider')).toBeAttached();
    await expect(page.getByTestId('checkout-order-export-totals-divider')).toBeAttached();
    await expect(page.getByTestId('checkout-order-export-footer-top-divider')).toBeAttached();
    await expect(page.getByTestId('checkout-order-export-footer-divider')).toBeAttached();
    await expect(page.getByTestId('checkout-order-export-copyright')).toContainText('All Rights Reserved');
    await expect(page.getByTestId('checkout-order-export-copyright')).toContainText('www.realize.com · email.is.here@email');
    await expect(page.getByTestId('checkout-order-export-footer')).toBeAttached();
  });

  test('maps checkout cart rows, pricing and order meta into the export document', async ({ page }) => {
    const unitPrice = ORDER_EXPORT_FIXTURE.product.price;
    const lineTotal = unitPrice * 1;
    const subtotal = lineTotal * ORDER_EXPORT_FIXTURE.rows.length;
    const grandTotal = subtotal;
    const vatTotal = calcVatFromGross(grandTotal);

    const documentText = await page.evaluate(() => window.__checkoutE2e?.getOrderExportText() ?? '');

    expect(documentText).toContain(ORDER_EXPORT_FIXTURE.orderMeta.orderNumber);
    expect(documentText).toContain(ORDER_EXPORT_FIXTURE.orderMeta.orderDate);
    expect(documentText).toContain('Marco Rossi');
    expect(documentText).toContain('Player');
    expect(documentText).toContain(formatItalianPrice(unitPrice));
    expect(documentText).toContain(formatItalianPrice(lineTotal));
    expect(documentText).toContain(formatItalianPrice(subtotal));
    expect(documentText).toContain(formatItalianPrice(vatTotal));
    expect(documentText).toContain(formatItalianPrice(grandTotal));

    const tableRows = page.getByTestId('checkout-order-export-document').locator('tbody tr');
    await expect(tableRows).toHaveCount(ORDER_EXPORT_FIXTURE.rows.length);

    await expect(tableRows.nth(0)).toContainText('L');
    await expect(tableRows.nth(1)).toContainText('XL');
    await expect(tableRows.nth(2)).toContainText('M');
  });

  test('matches the checkout order export visual snapshot', async ({ page }) => {
    await page.evaluate(() => window.__checkoutE2e?.revealOrderExportDocument());

    const documentRoot = page.getByTestId('checkout-order-export-document');
    await expect(documentRoot).toBeVisible();

    await expect(documentRoot).toHaveScreenshot('checkout-order-export-document.png', {
      maxDiffPixelRatio: 0.02,
    });
  });
});
