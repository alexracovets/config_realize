import type { buildOrderCuttingExportParamsType, checkoutProductType, orderCuttingExportType } from '@types';
import { getModel } from '@utils/garmentCatalog/garmentCatalog';
import { buildOrderCuttingExportSteps } from '@utils/buildOrderCuttingExportSteps';

const DEFAULT_CUSTOMER = {
  company: '',
  vatOrTaxCode: '',
  firstName: '',
  lastName: '',
  address: '',
  city: '',
  province: '',
  postalCode: '',
  email: '',
  pec: '',
};

const formatModelIdLabel = (modelId: string) =>
  modelId
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const resolveOrderCuttingExportModelLabel = (product: checkoutProductType) => {
  const businessName = product.business.name.trim();
  if (businessName) return businessName;

  const modelName = getModel(product.modelId)?.name?.trim();
  if (modelName) return modelName;

  return formatModelIdLabel(product.modelId);
};

const buildOrderCuttingExportArticles = (products: checkoutProductType[]) =>
  products.flatMap((product) => {
    const modelLabel = resolveOrderCuttingExportModelLabel(product);

    return product.rows.map((row) => ({
      modelLabel,
      size: row.size,
      quantity: row.quantity,
      jerseyName: row.name.trim() || '—',
      number: row.number.trim() || '—',
    }));
  });

const buildOrderCuttingExport = ({
  products,
  configurations,
  orderNumber = '',
  orderDate = '',
  customer = {},
}: buildOrderCuttingExportParamsType): orderCuttingExportType => ({
  orderNumber,
  orderDate,
  customer: { ...DEFAULT_CUSTOMER, ...customer },
  articles: buildOrderCuttingExportArticles(products),
  products: products.map((product) => {
    const model = getModel(product.modelId);
    const configuration = configurations[product.cartItemId];
    const modelLabel = resolveOrderCuttingExportModelLabel(product);

    return {
      cartItemId: product.cartItemId,
      productTitle: product.business.name,
      modelId: product.modelId,
      modelLabel,
      printAtlas: {
        width: model?.printAtlas?.width ?? 2048,
        height: model?.printAtlas?.height ?? 2048,
      },
      steps: configuration && model ? buildOrderCuttingExportSteps(configuration, model, product.business.printReferenceCm) : [],
    };
  }),
});

export { buildOrderCuttingExport, formatModelIdLabel, resolveOrderCuttingExportModelLabel };
