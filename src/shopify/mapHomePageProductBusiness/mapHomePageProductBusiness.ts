import { DEFAULT_CURRENCY_CODE, deriveLocalBusiness } from '@utils/garmentCatalog/garmentCatalog';
import type { garmentBusinessType, homePageProductType, modelIdType } from '@types';

const mapHomePageProductBusiness = (product: homePageProductType, modelId: modelIdType): garmentBusinessType => ({
  ...deriveLocalBusiness(modelId),
  shopifyProductId: product.id,
  handle: product.handle,
  name: product.title,
  price: product.price ?? 0,
  currencyCode: product.currencyCode ?? DEFAULT_CURRENCY_CODE,
});

export { mapHomePageProductBusiness };
