import type { configuratorStepValueType } from '@configurator/types';
import { buildPatternColors } from '@configurator/hooks/useSyncGarmentMaterials/buildPatternColors';
import { createPrintUnit, mapProductDesigns, resolveGradientColors, resolvePartUvBounds, resolvePrintCmScale } from '@configurator/mappers';
import { LOGO_UPLOAD_ROTATION_DEG, PRINT_UPLOAD_ROTATION_DEG } from '@configurator/constants';
import { CONFIGURATOR_STEP_META, ORDER_CUTTING_EXPORT_DATA_NOT_SPECIFIED } from '@constants';
import type {
  cartItemConfigurationType,
  garmentConfigType,
  garmentTextRenderInstanceType,
  logoInstanceType,
  numberInstanceType,
  orderCuttingExportColorPartSpecType,
  orderCuttingExportConfigurationStepType,
  orderCuttingExportDesignLayerSpecType,
  orderCuttingExportDownloadFileType,
  orderCuttingExportLogoStampSpecType,
  orderCuttingExportStepDetailParamType,
  orderCuttingExportStepDetailType,
  orderCuttingExportTextLayerSpecType,
  printCmScaleType,
  printReferenceCmType,
  testoInstanceType,
  uvPointType,
} from '@types';

const formatPercent = (value: number): string => `${Math.round(value * 100)}%`;

const formatDegrees = (value: number): string => `${Math.round(value)}°`;

const formatUv = (uv: uvPointType): string => `UV (${uv.x.toFixed(3)}, ${uv.y.toFixed(3)})`;

const resolvePartLabel = (model: garmentConfigType, partId: string): string => {
  const part = model.parts.find((item) => item.id === partId || item.name === partId);
  return part ? part.label || part.name : partId;
};

const resolvePartPrintRotation = (part: garmentConfigType['parts'][number]): number => part.printRotation ?? part.gradient?.rotation ?? 0;

const resolvePatternIndex = (activePatternKey: string | null): number => {
  if (!activePatternKey) return 0;
  const match = /^pattern-(\d+)$/.exec(activePatternKey);
  return match ? Number(match[1]) : 0;
};

const buildColorStepDetails = (configuration: cartItemConfigurationType, model: garmentConfigType): orderCuttingExportStepDetailType[] =>
  model.parts.map((part) => ({
    label: part.label || part.name,
    value: configuration.color.byPart[part.id] ?? configuration.color.byPart[part.name] ?? '—',
  }));

const hasEnabledGradient = (configuration: cartItemConfigurationType): boolean =>
  Object.values(configuration.color.gradientsByPart).some((gradient) => gradient.enabled);

const buildGradientStepDetails = (configuration: cartItemConfigurationType, model: garmentConfigType): orderCuttingExportStepDetailType[] =>
  model.parts
    .filter((part) => !part.colorOnly)
    .map((part) => {
      const gradient = configuration.color.gradientsByPart[part.id] ?? configuration.color.gradientsByPart[part.name];
      if (!gradient?.enabled) {
        return { label: part.label || part.name, value: ORDER_CUTTING_EXPORT_DATA_NOT_SPECIFIED };
      }

      const baseColor = configuration.color.byPart[part.id] ?? configuration.color.byPart[part.name] ?? '—';

      return {
        label: part.label || part.name,
        value: `${baseColor} → ${gradient.color2}`,
        params: [
          { label: 'Colore', value: `${baseColor} → ${gradient.color2}` },
          { label: 'Rotazione', value: formatDegrees(gradient.rotation) },
          { label: 'Posizione', value: formatPercent(gradient.position) },
          { label: 'Morbidezza', value: formatPercent(gradient.softness) },
          { label: 'Opacità', value: formatPercent(gradient.opacity) },
          { label: 'Direzione', value: gradient.reversed ? 'Invertita' : 'Normale' },
        ],
      };
    });

const buildTextInstancesDetails = (
  instances: garmentTextRenderInstanceType[],
  model: garmentConfigType,
  cmScale: printCmScaleType | null,
): orderCuttingExportStepDetailType[] =>
  instances
    .filter((instance) => instance.text.trim())
    .map((instance) => {
      const lineHeight = (instance as numberInstanceType).lineHeight;
      const letterSpacing = (instance as testoInstanceType).letterSpacing;
      const unitX = createPrintUnit(cmScale?.cmPerPxHorizontal);
      const unitY = createPrintUnit(cmScale?.cmPerPxVertical);
      const params = [
        { label: 'Testo', value: instance.text.trim() },
        { label: 'Font', value: instance.font },
        { label: 'Colore testo', value: instance.textColor },
        { label: 'Corpo', value: unitY.formatPx(instance.fontSize) },
        instance.strokeWidth > 0 ? { label: 'Contorno', value: `${instance.strokeColor} · ${unitY.formatPx(instance.strokeWidth)}` } : null,
        typeof lineHeight === 'number' ? { label: 'Interlinea', value: `${lineHeight}` } : null,
        typeof letterSpacing === 'number' ? { label: 'Spaziatura', value: unitX.formatPx(letterSpacing) } : null,
        { label: 'Parte', value: resolvePartLabel(model, instance.partId) },
        { label: 'Posizione', value: formatUv(instance.uv) },
        { label: 'Rotazione', value: formatDegrees(instance.rotation + (instance.placementRotation ?? 0)) },
      ].filter((param): param is orderCuttingExportStepDetailParamType => param !== null);

      return {
        label: instance.label,
        value: instance.text.trim(),
        params,
      };
    });

const resolvePartColor = (configuration: cartItemConfigurationType, partId: string, partName: string): string =>
  configuration.color.byPart[partId] ?? configuration.color.byPart[partName] ?? '#FFFFFF';

const resolveModelSrc = (model: garmentConfigType): string => `${model.path}${model.modelFile ?? 'model.glb'}`;

const resolveAtlasSize = (model: garmentConfigType) => ({
  atlasWidth: model.printAtlas?.width ?? 2048,
  atlasHeight: model.printAtlas?.height ?? 2048,
});

const buildConfiguredColorParts = (configuration: cartItemConfigurationType, model: garmentConfigType): orderCuttingExportColorPartSpecType[] =>
  model.parts.map((part) => {
    const baseColor = resolvePartColor(configuration, part.id, part.name);
    const gradient = part.colorOnly ? undefined : (configuration.color.gradientsByPart[part.id] ?? configuration.color.gradientsByPart[part.name]);

    if (!gradient?.enabled) {
      return { label: part.label || part.name, color: baseColor, meshNames: part.meshNames };
    }

    const { fabricColor, gradientColor2 } = resolveGradientColors(baseColor, gradient);

    return {
      label: part.label || part.name,
      color: fabricColor,
      meshNames: part.meshNames,
      gradient: {
        color2: gradientColor2,
        rotation: gradient.rotation,
        position: gradient.position,
        softness: gradient.softness,
        opacity: gradient.opacity,
        uvBounds: resolvePartUvBounds(part),
      },
    };
  });

const buildColorDownloadFiles = (configuration: cartItemConfigurationType, model: garmentConfigType): orderCuttingExportDownloadFileType[] => {
  const parts = model.parts;
  if (parts.length === 0) return [];

  const { atlasWidth, atlasHeight } = resolveAtlasSize(model);

  return [
    {
      key: 'color-atlas',
      label: 'UV Colore',
      fileName: 'color_uv_atlas.png',
      downloadUrl: '',
      composeKind: 'color-atlas' as const,
      modelSrc: resolveModelSrc(model),
      atlasWidth,
      atlasHeight,
      colorParts: parts.map((part) => ({
        label: part.label || part.name,
        color: resolvePartColor(configuration, part.id, part.name),
        meshNames: part.meshNames,
      })),
    },
  ];
};

const buildGradientDownloadFiles = (configuration: cartItemConfigurationType, model: garmentConfigType): orderCuttingExportDownloadFileType[] => {
  if (model.parts.length === 0) return [];

  const { atlasWidth, atlasHeight } = resolveAtlasSize(model);

  return [
    {
      key: 'gradient-atlas',
      label: 'UV Sfumatura',
      fileName: 'gradient_uv_atlas.png',
      downloadUrl: '',
      composeKind: 'gradient-atlas' as const,
      modelSrc: resolveModelSrc(model),
      atlasWidth,
      atlasHeight,
      colorParts: buildConfiguredColorParts(configuration, model),
    },
  ];
};

const resolveTextTotalRotation = (instance: garmentTextRenderInstanceType, model: garmentConfigType): number => {
  const part = model.parts.find((item) => item.id === instance.partId || item.name === instance.partId);
  const instanceRotation = instance.placementRotation !== undefined ? instance.rotation + instance.placementRotation : instance.rotation;

  return instanceRotation + PRINT_UPLOAD_ROTATION_DEG + (part ? resolvePartPrintRotation(part) : 0);
};

const buildTextLayerSpecs = (instances: garmentTextRenderInstanceType[], model: garmentConfigType): orderCuttingExportTextLayerSpecType[] =>
  instances
    .filter((instance) => instance.text.trim())
    .map((instance) => ({
      text: instance.text.trim(),
      font: instance.font,
      textColor: instance.textColor,
      strokeColor: instance.strokeColor,
      strokeWidth: instance.strokeWidth,
      fontSize: instance.fontSize,
      uv: instance.uv,
      rotation: resolveTextTotalRotation(instance, model),
      lineHeight: (instance as numberInstanceType).lineHeight,
      letterSpacing: (instance as testoInstanceType).letterSpacing,
    }));

const buildTextDownloadFiles = (
  stepKey: 'name' | 'number' | 'testo',
  instances: garmentTextRenderInstanceType[],
  model: garmentConfigType,
): orderCuttingExportDownloadFileType[] => {
  const textLayers = buildTextLayerSpecs(instances, model);
  if (textLayers.length === 0) return [];

  const { atlasWidth, atlasHeight } = resolveAtlasSize(model);

  return [
    {
      key: `${stepKey}-uv-layer`,
      label: 'UV Stampa',
      fileName: `${stepKey}_uv_layer.png`,
      downloadUrl: '',
      composeKind: 'text-layer' as const,
      atlasWidth,
      atlasHeight,
      textLayers,
    },
  ];
};

const buildColoredDesignFileName = (pathName: string, color: string): string => {
  const baseName = pathName.replace(/\.[^.]+$/, '');
  const colorSlug = color.replace('#', '').toLowerCase();
  return `${baseName}_uv_${colorSlug}.png`;
};

const resolveDesignComposeLayers = (
  configuration: cartItemConfigurationType,
  model: garmentConfigType,
): { layers: orderCuttingExportDesignLayerSpecType[]; opacity: number; patternName: string } | null => {
  const patternIndex = resolvePatternIndex(configuration.design.activePatternKey);
  const pattern = model.patterns[patternIndex];
  if (!pattern || configuration.design.activePatternKey === null) return null;

  const designPattern = mapProductDesigns(model)[patternIndex];
  const layerColors = buildPatternColors(designPattern ?? null, configuration.design.patternColors, configuration.design.designLayerColors);

  return {
    opacity: configuration.design.designOpacity,
    patternName: pattern.name,
    layers: pattern.parts.map((part, index) => ({
      maskSrc: `${model.path}designs/${part.path_name}`,
      color: layerColors[index] ?? layerColors[0] ?? '#000000',
    })),
  };
};

const buildDesignDownloadFiles = (configuration: cartItemConfigurationType, model: garmentConfigType): orderCuttingExportDownloadFileType[] => {
  const design = resolveDesignComposeLayers(configuration, model);
  if (!design) return [];

  const files: orderCuttingExportDownloadFileType[] = design.layers.map((layer, index) => {
    const pathName = layer.maskSrc.split('/').pop() ?? `layer-${index}`;

    return {
      key: `design-layer-${index}`,
      label: `Texture ${index + 1}`,
      fileName: buildColoredDesignFileName(pathName, layer.color),
      downloadUrl: '',
      composeKind: 'design-layer' as const,
      maskSrc: layer.maskSrc,
      color: layer.color,
      opacity: design.opacity,
    };
  });

  if (design.layers.length > 1) {
    files.push({
      key: 'design-mix',
      label: 'MIX',
      fileName: `${design.patternName.replace(/\s+/g, '_').toLowerCase()}_uv_mix.png`,
      downloadUrl: '',
      composeKind: 'design-mix' as const,
      opacity: design.opacity,
      layers: design.layers,
    });
  }

  return files;
};

const resolveLogoExportLabel = (instance: logoInstanceType) => instance.label || instance.fileName || 'Logo';

const buildLogoStampSpecs = (configuration: cartItemConfigurationType, model: garmentConfigType): orderCuttingExportLogoStampSpecType[] =>
  configuration.logo.instances
    .filter((instance) => instance.src.trim())
    .map((instance) => {
      const part = model.parts.find((item) => item.id === instance.partId || item.name === instance.partId);

      return {
        src: instance.src,
        label: resolveLogoExportLabel(instance),
        fileName: instance.fileName || undefined,
        uv: instance.uv,
        rotation: instance.rotation + (instance.uploadRotation ?? LOGO_UPLOAD_ROTATION_DEG) + (part ? resolvePartPrintRotation(part) : 0),
        opacity: instance.opacity ?? 1,
        scale: instance.scale,
        naturalWidth: instance.naturalWidth,
        naturalHeight: instance.naturalHeight,
      };
    });

const buildComplexDownloadFiles = (configuration: cartItemConfigurationType, model: garmentConfigType): orderCuttingExportDownloadFileType[] => {
  const colorParts = buildConfiguredColorParts(configuration, model);
  if (colorParts.length === 0) return [];

  const { atlasWidth, atlasHeight } = resolveAtlasSize(model);
  const design = resolveDesignComposeLayers(configuration, model);
  const defaultPart = model.default_pattern?.[0]?.parts[0];

  return [
    {
      key: 'complex-atlas',
      label: 'UV Complex',
      fileName: 'complex_uv_atlas.png',
      downloadUrl: '',
      composeKind: 'complex-atlas' as const,
      modelSrc: resolveModelSrc(model),
      atlasWidth,
      atlasHeight,
      colorParts,
      opacity: design?.opacity,
      layers: design?.layers,
      textLayers: [
        ...buildTextLayerSpecs(configuration.name.instances, model),
        ...buildTextLayerSpecs(configuration.testo.instances, model),
        ...buildTextLayerSpecs(configuration.number.instances, model),
      ],
      logoStamps: buildLogoStampSpecs(configuration, model),
      defaultLogosSrc: defaultPart ? `${model.path}designs/${defaultPart.path_name}` : undefined,
    },
  ];
};

const buildComplexStep = (configuration: cartItemConfigurationType, model: garmentConfigType): orderCuttingExportConfigurationStepType => {
  const downloadFiles = buildComplexDownloadFiles(configuration, model);

  return {
    step: 0,
    key: 'complex',
    title: 'Complex',
    isConfigured: downloadFiles.length > 0,
    emptyMessage: ORDER_CUTTING_EXPORT_DATA_NOT_SPECIFIED,
    details: [],
    downloadFiles,
  };
};

const buildLogoDownloadFiles = (configuration: cartItemConfigurationType): orderCuttingExportDownloadFileType[] =>
  configuration.logo.instances
    .filter((instance) => !instance.isDefault && instance.src.trim())
    .map((instance) => ({
      key: `logo-${instance.id}`,
      label: resolveLogoExportLabel(instance),
      fileName: instance.fileName || `logo-${instance.id}`,
      downloadUrl: instance.src,
      previewSrc: instance.src,
    }));

const buildDesignStepDetails = (configuration: cartItemConfigurationType, model: garmentConfigType): orderCuttingExportStepDetailType[] => {
  const patternIndex = resolvePatternIndex(configuration.design.activePatternKey);
  const pattern = model.patterns[patternIndex];
  if (!pattern) return [];

  const details: orderCuttingExportStepDetailType[] = [
    { label: 'Design', value: pattern.name },
    { label: 'Opacità pattern', value: `${Math.round(configuration.design.designOpacity * 100)}%` },
  ];

  Object.entries(configuration.design.designLayerColors).forEach(([layerIndex, color]) => {
    details.push({ label: `Colore layer ${Number(layerIndex) + 1}`, value: color });
  });

  return details;
};

const buildStep = (
  key: configuratorStepValueType,
  configuration: cartItemConfigurationType,
  model: garmentConfigType,
  cmScale: printCmScaleType | null,
): orderCuttingExportConfigurationStepType => {
  const meta = CONFIGURATOR_STEP_META.find((item) => item.value === key);
  const title = meta?.label ?? key;
  const step = meta?.step ?? 0;
  const emptyMessage = ORDER_CUTTING_EXPORT_DATA_NOT_SPECIFIED;

  switch (key) {
    case 'colore': {
      const details = buildColorStepDetails(configuration, model);
      return {
        step,
        key,
        title,
        isConfigured: details.length > 0,
        emptyMessage,
        details,
        downloadFiles: buildColorDownloadFiles(configuration, model),
      };
    }
    case 'design': {
      const isConfigured = configuration.design.activePatternKey !== null;
      return {
        step,
        key,
        title,
        isConfigured,
        emptyMessage,
        details: isConfigured ? buildDesignStepDetails(configuration, model) : [],
        downloadFiles: isConfigured ? buildDesignDownloadFiles(configuration, model) : [],
      };
    }
    case 'shading': {
      const isConfigured = hasEnabledGradient(configuration);
      return {
        step,
        key,
        title,
        isConfigured,
        emptyMessage,
        details: isConfigured ? buildGradientStepDetails(configuration, model) : [],
        downloadFiles: isConfigured ? buildGradientDownloadFiles(configuration, model) : [],
      };
    }
    case 'name': {
      const details = buildTextInstancesDetails(configuration.name.instances, model, cmScale);
      return {
        step,
        key,
        title,
        isConfigured: details.length > 0,
        emptyMessage,
        details,
        downloadFiles: buildTextDownloadFiles('name', configuration.name.instances, model),
      };
    }
    case 'number': {
      const details = buildTextInstancesDetails(configuration.number.instances, model, cmScale);
      return {
        step,
        key,
        title,
        isConfigured: details.length > 0,
        emptyMessage,
        details,
        downloadFiles: buildTextDownloadFiles('number', configuration.number.instances, model),
      };
    }
    case 'testo': {
      const details = buildTextInstancesDetails(configuration.testo.instances, model, cmScale);
      return {
        step,
        key,
        title,
        isConfigured: details.length > 0,
        emptyMessage,
        details,
        downloadFiles: buildTextDownloadFiles('testo', configuration.testo.instances, model),
      };
    }
    case 'logo': {
      const userLogos = configuration.logo.instances.filter((instance) => !instance.isDefault && instance.src.trim());
      const details = userLogos.map((instance: logoInstanceType) => {
        const params = [
          { label: 'File', value: instance.fileName || 'file caricato' },
          { label: 'Parte', value: resolvePartLabel(model, instance.partId) },
          { label: 'Posizione', value: formatUv(instance.uv) },
          { label: 'Scala', value: formatPercent(instance.scale) },
          { label: 'Rotazione', value: formatDegrees(instance.rotation + instance.uploadRotation) },
          { label: 'Opacità', value: formatPercent(instance.opacity) },
          instance.naturalWidth > 0
            ? {
                label: 'File originale',
                value: `${createPrintUnit(cmScale?.cmPerPxHorizontal).formatPx(instance.naturalWidth)} × ${createPrintUnit(cmScale?.cmPerPxVertical).formatPx(instance.naturalHeight)}`,
              }
            : null,
        ].filter((param): param is orderCuttingExportStepDetailParamType => param !== null);

        return {
          label: instance.label || instance.fileName || 'Logo',
          value: instance.fileName || 'file caricato',
          params,
        };
      });
      return {
        step,
        key,
        title,
        isConfigured: details.length > 0,
        emptyMessage,
        details,
        downloadFiles: buildLogoDownloadFiles(configuration),
      };
    }
    default:
      return {
        step,
        key,
        title,
        isConfigured: false,
        emptyMessage,
        details: [],
        downloadFiles: [],
      };
  }
};

const buildOrderCuttingExportSteps = (
  configuration: cartItemConfigurationType,
  model: garmentConfigType,
  printReferenceCm?: printReferenceCmType | null,
): orderCuttingExportConfigurationStepType[] => {
  const cmScale = resolvePrintCmScale(model, printReferenceCm);
  const configurationSteps = CONFIGURATOR_STEP_META.filter((meta) => !model.hiddenSteps?.includes(meta.value)).map((meta) =>
    buildStep(meta.value, configuration, model, cmScale),
  );

  return [buildComplexStep(configuration, model), ...configurationSteps];
};

export { buildOrderCuttingExportSteps };
