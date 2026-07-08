import { composeGarmentColorUvAtlas } from '@utils/composeGarmentColorUvAtlas';
import { composeDesignUvLayerPreview, composeDesignUvMixPreview } from '@utils/composeDesignUvPreview';
import { composeTextUvLayer } from '@utils/composeTextUvLayer';
import type { orderCuttingExportDownloadFileType } from '@types';

/** Mirrors `OrderCuttingExportDownloadCard`'s compose logic to produce a temporary object URL. */
const composeOrderCuttingExportDownloadFile = async (file: orderCuttingExportDownloadFileType): Promise<string | null> => {
  if (file.composeKind === 'design-layer' && file.maskSrc && file.color) {
    return composeDesignUvLayerPreview(file.maskSrc, file.color, file.opacity ?? 1);
  }

  if (file.composeKind === 'design-mix' && file.layers?.length) {
    return composeDesignUvMixPreview(file.layers, file.opacity ?? 1);
  }

  if (
    (file.composeKind === 'color-atlas' || file.composeKind === 'gradient-atlas') &&
    file.modelSrc &&
    file.colorParts?.length &&
    file.atlasWidth &&
    file.atlasHeight
  ) {
    return composeGarmentColorUvAtlas(file.modelSrc, file.atlasWidth, file.atlasHeight, file.colorParts);
  }

  if (file.composeKind === 'text-layer' && file.textLayers?.length && file.atlasWidth && file.atlasHeight) {
    return composeTextUvLayer(file.atlasWidth, file.atlasHeight, file.textLayers);
  }

  return null;
};

export { composeOrderCuttingExportDownloadFile };
