'use client';

import { useLayoutEffect } from 'react';

import type { configuratorProductHydrationType } from '@types';
import { useConfigurationCart } from '@store';
import { DEFAULT_MODEL_ID, deriveLocalBusiness, hasModel } from '@utils';

/**
 * Hydrates the configurator from the `/:slug` route:
 * stamps the catalog product (model id + business data) onto the active cart item,
 * which in turn loads the matching local geometry into the configurator product store.
 *
 * Falls back to the default model when the slug has no model mapping
 * (or maps to an unknown model) so the configurator still opens.
 */
const useConfiguratorProductHydration = (slug: string, product: configuratorProductHydrationType | null) => {
  useLayoutEffect(() => {
    const isMapped = product != null && hasModel(product.modelId);

    const modelId = isMapped ? product.modelId : DEFAULT_MODEL_ID;
    const business = isMapped ? product.business : deriveLocalBusiness(modelId);

    useConfigurationCart.getState().setActiveItemProduct({ slug, modelId, business });
  }, [slug, product]);
};

export { useConfiguratorProductHydration };
