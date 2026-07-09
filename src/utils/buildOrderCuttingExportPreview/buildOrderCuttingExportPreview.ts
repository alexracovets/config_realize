import type { buildOrderCuttingExportPreviewParamsType, cartItemConfigurationType, checkoutProductType, modelIdType } from '@types';
import { deriveLocalBusiness, getModel } from '@utils/garmentCatalog/garmentCatalog';
import { buildOrderCuttingExport } from '@utils/buildOrderCuttingExport';

const PREVIEW_MODEL_ID = 'baggio_calcio' as const;
const PREVIEW_CART_ITEM_ID = 'preview-cart-item';

const buildPreviewConfiguration = (modelId: modelIdType, patternIndex: number): cartItemConfigurationType => {
  const model = getModel(modelId);
  if (!model) {
    throw new Error(`Model "${modelId}" is not registered in the garment catalog.`);
  }

  const partIds = model.parts.map((part) => part.id);
  const primaryPartId = partIds[0] ?? 'body';

  const gradientsByPart = Object.fromEntries(
    model.parts.map((part) => [
      part.id,
      {
        enabled: part.id === primaryPartId,
        color2: '#A3E8FF',
        reversed: false,
        rotation: 90,
        position: 0.5,
        softness: 0.35,
        opacity: 1,
      },
    ]),
  );

  return {
    color: {
      byPart: Object.fromEntries(model.parts.map((part) => [part.id, part.id === primaryPartId ? '#0066FF' : '#E91E8C'])),
      gradientsByPart,
    },
    design: {
      activePatternKey: `pattern-${patternIndex}`,
      patternColors: {},
      designLayerColors: { 0: '#000000', 1: '#000000' },
      activeOpacity: 1,
      designOpacity: 0.85,
    },
    name: {
      instances: [
        {
          id: 'preview-name',
          positionKey: 'name-0',
          label: 'Nome dorsale',
          partId: primaryPartId,
          text: 'ROSSI',
          font: model.nameDefaults?.font ?? 'Oswald',
          textColor: model.nameDefaults?.textColor ?? '#000000',
          strokeColor: model.nameDefaults?.strokeColor ?? '#FFFFFF',
          strokeWidth: model.nameDefaults?.strokeWidth ?? 2,
          uv: { x: 0.5, y: 0.5 },
          rotation: 0,
          fontSize: 120,
          showFrame: false,
          showGizmo: false,
        },
      ],
      selectedInstanceId: 'preview-name',
    },
    number: {
      instances: [
        {
          id: 'preview-number',
          positionKey: 'number-0',
          label: 'Numero dorsale',
          partId: primaryPartId,
          text: '10',
          font: model.numberDefaults?.font ?? 'Oswald',
          textColor: model.numberDefaults?.textColor ?? '#000000',
          strokeColor: model.numberDefaults?.strokeColor ?? '#FFFFFF',
          strokeWidth: model.numberDefaults?.strokeWidth ?? 2,
          uv: { x: 0.5, y: 0.35 },
          rotation: 0,
          fontSize: 180,
          lineHeight: 1,
          showFrame: false,
          showGizmo: false,
        },
      ],
      selectedInstanceId: 'preview-number',
    },
    testo: {
      instances: [],
      selectedInstanceId: null,
    },
    logo: {
      instances: [],
      selectedInstanceId: null,
    },
  };
};

const buildPreviewProduct = (modelId: modelIdType): checkoutProductType => {
  const business = deriveLocalBusiness(modelId);

  return {
    cartItemId: PREVIEW_CART_ITEM_ID,
    modelId,
    business,
    rowPreset: { size: 'M', name: 'ROSSI', number: '10', testoTexts: [] },
    rows: [
      { id: 'preview-row-1', size: 'M', name: 'ROSSI', number: '10', testoTexts: [], quantity: 2 },
      { id: 'preview-row-2', size: 'L', name: 'BIANCHI', number: '7', testoTexts: [], quantity: 1 },
      { id: 'preview-row-3', size: 'XL', name: 'VERDI', number: '23', testoTexts: [], quantity: 1 },
    ],
  };
};

const buildOrderCuttingExportPreview = ({ modelId = PREVIEW_MODEL_ID, patternIndex = 0 }: buildOrderCuttingExportPreviewParamsType = {}) => {
  const resolvedModelId = modelId ?? PREVIEW_MODEL_ID;
  const configuration = buildPreviewConfiguration(resolvedModelId, patternIndex);

  return buildOrderCuttingExport({
    products: [buildPreviewProduct(resolvedModelId)],
    configurations: { [PREVIEW_CART_ITEM_ID]: configuration },
    orderNumber: '#9077614237',
    orderDate: '6 luglio 2026',
    customer: {
      company: 'ASD Sportiva Milano',
      vatOrTaxCode: 'IT12345678901',
      firstName: 'Marco',
      lastName: 'Rossi',
      address: 'Via Giuseppe Verdi 24',
      city: 'Milano',
      province: 'MI',
      postalCode: '20121',
      email: 'marco.rossi@example.com',
      pec: 'asd.milano@pec.it',
    },
  });
};

export { buildOrderCuttingExportPreview, PREVIEW_CART_ITEM_ID, PREVIEW_MODEL_ID };
