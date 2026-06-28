import { getModel, resolveProductPreviewSrc } from '@utils/garmentCatalog/garmentCatalog';

const resolveLocalPreviewByModelId = (modelId: string | null | undefined) => {
  if (!modelId) {
    return { previewSrc: null, activePreviewSrc: null };
  }

  const product = getModel(modelId);
  const previewSrc = product ? resolveProductPreviewSrc(product) : null;

  return {
    previewSrc: previewSrc || null,
    activePreviewSrc: previewSrc || null,
  };
};

export { resolveLocalPreviewByModelId };
