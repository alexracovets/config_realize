import type { garmentConfigType } from '@types';

const resolveModelUrl = (product: garmentConfigType): string => {
  const base = product.path.endsWith('/') ? product.path : `${product.path}/`;
  return `${base}${product.modelFile ?? 'model.glb'}`;
};

export { resolveModelUrl };
