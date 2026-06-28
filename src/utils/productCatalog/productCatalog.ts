import { deriveLocalBusiness, hasModel } from '@utils/garmentCatalog/garmentCatalog';
import type { configuratorProductHydrationType } from '@configurator/types';

const resolveConfiguratorProductBySlug = (slug: string): configuratorProductHydrationType | null => {
  if (!hasModel(slug)) return null;

  const business = deriveLocalBusiness(slug);

  return {
    modelId: slug,
    business: {
      ...business,
      handle: slug,
      name: business.name,
    },
  };
};

export { resolveConfiguratorProductBySlug };
