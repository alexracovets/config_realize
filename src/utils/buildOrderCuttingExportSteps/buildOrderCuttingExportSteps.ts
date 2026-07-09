import type { configuratorStepValueType } from '@configurator/types';
import { buildPatternColors } from '@configurator/hooks/useSyncGarmentMaterials/buildPatternColors';
import { mapProductDesigns, resolveGradientColors, resolvePartUvBounds } from '@configurator/mappers';
import { PRINT_UPLOAD_ROTATION_DEG } from '@configurator/constants';
import { CONFIGURATOR_STEP_META, ORDER_CUTTING_EXPORT_DATA_NOT_SPECIFIED } from '@constants';
import type {
  cartItemConfigurationType,
  garmentConfigType,
  garmentTextRenderInstanceType,
  logoInstanceType,
  numberInstanceType,
  orderCuttingExportConfigurationStepType,
  orderCuttingExportDownloadFileType,
  orderCuttingExportStepDetailParamType,
  orderCuttingExportStepDetailType,
  orderCuttingExportTextLayerSpecType,
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

const buildTextInstancesDetails = (instances: garmentTextRenderInstanceType[], model: garmentConfigType): orderCuttingExportStepDetailType[] =>
  instances
    .filter((instance) => instance.text.trim())
    .map((instance) => {
      const lineHeight = (instance as numberInstanceType).lineHeight;
      const letterSpacing = (instance as testoInstanceType).letterSpacing;
      const params = [
        { label: 'Testo', value: instance.text.trim() },
        { label: 'Font', value: instance.font },
        { label: 'Colore testo', value: instance.textColor },
        { label: 'Corpo', value: `${Math.round(instance.fontSize)}px` },
        instance.strokeWidth > 0 ? { label: 'Contorno', value: `${instance.strokeColor} · ${instance.strokeWidth}px` } : null,
        typeof lineHeight === 'number' ? { label: 'Interlinea', value: `${lineHeight}` } : null,
        typeof letterSpacing === 'number' ? { label: 'Spaziatura', value: `${letterSpacing}` } : null,
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

const buildColorDownloadFiles = (configuration: cartItemConfigurationType, model: garmentConfigType): orderCuttingExportDownloadFileType[] => {
  const parts = model.parts;
  const atlasWidth = model.printAtlas?.width ?? 2048;
  const atlasHeight = model.printAtlas?.height ?? 2048;
  const modelSrc = `${model.path}${model.modelFile ?? 'model.glb'}`;

  if (parts.length === 0) return [];

  return [
    {
      key: 'color-atlas',
      label: 'UV Colore',
      fileName: 'color_uv_atlas.png',
      downloadUrl: '',
      composeKind: 'color-atlas' as const,
      modelSrc,
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

  return [
    {
      key: 'gradient-atlas',
      label: 'UV Sfumatura',
      fileName: 'gradient_uv_atlas.png',
      downloadUrl: '',
      composeKind: 'gradient-atlas' as const,
      modelSrc: `${model.path}${model.modelFile ?? 'model.glb'}`,
      atlasWidth: model.printAtlas?.width ?? 2048,
      atlasHeight: model.printAtlas?.height ?? 2048,
      colorParts: model.parts.map((part) => {
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
      }),
    },
  ];
};

const resolveTextTotalRotation = (instance: garmentTextRenderInstanceType, model: garmentConfigType): number => {
  const part = model.parts.find((item) => item.id === instance.partId || item.name === instance.partId);
  const instanceRotation = instance.placementRotation !== undefined ? instance.rotation + instance.placementRotation : instance.rotation;

  return instanceRotation + PRINT_UPLOAD_ROTATION_DEG + (part ? resolvePartPrintRotation(part) : 0);
};

const buildTextDownloadFiles = (
  stepKey: 'name' | 'number' | 'testo',
  instances: garmentTextRenderInstanceType[],
  model: garmentConfigType,
): orderCuttingExportDownloadFileType[] => {
  const textLayers: orderCuttingExportTextLayerSpecType[] = instances
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

  if (textLayers.length === 0) return [];

  return [
    {
      key: `${stepKey}-uv-layer`,
      label: 'UV Stampa',
      fileName: `${stepKey}_uv_layer.png`,
      downloadUrl: '',
      composeKind: 'text-layer' as const,
      atlasWidth: model.printAtlas?.width ?? 2048,
      atlasHeight: model.printAtlas?.height ?? 2048,
      textLayers,
    },
  ];
};

const buildColoredDesignFileName = (pathName: string, color: string): string => {
  const baseName = pathName.replace(/\.[^.]+$/, '');
  const colorSlug = color.replace('#', '').toLowerCase();
  return `${baseName}_uv_${colorSlug}.png`;
};

const buildDesignDownloadFiles = (configuration: cartItemConfigurationType, model: garmentConfigType): orderCuttingExportDownloadFileType[] => {
  const patternIndex = resolvePatternIndex(configuration.design.activePatternKey);
  const pattern = model.patterns[patternIndex];
  if (!pattern) return [];

  const designPattern = mapProductDesigns(model)[patternIndex];
  const layerColors = buildPatternColors(designPattern ?? null, configuration.design.patternColors, configuration.design.designLayerColors);
  const opacity = configuration.design.designOpacity;

  const files: orderCuttingExportDownloadFileType[] = pattern.parts.map((part, index) => {
    const maskSrc = `${model.path}designs/${part.path_name}`;
    const color = layerColors[index] ?? layerColors[0] ?? '#000000';

    return {
      key: `design-layer-${index}`,
      label: `Texture ${index + 1}`,
      fileName: buildColoredDesignFileName(part.path_name, color),
      downloadUrl: '',
      composeKind: 'design-layer' as const,
      maskSrc,
      color,
      opacity,
    };
  });

  if (pattern.parts.length > 1) {
    files.push({
      key: 'design-mix',
      label: 'MIX',
      fileName: `${pattern.name.replace(/\s+/g, '_').toLowerCase()}_uv_mix.png`,
      downloadUrl: '',
      composeKind: 'design-mix' as const,
      opacity,
      layers: pattern.parts.map((part, index) => ({
        maskSrc: `${model.path}designs/${part.path_name}`,
        color: layerColors[index] ?? layerColors[0] ?? '#000000',
      })),
    });
  }

  return files;
};

const buildLogoDownloadFiles = (configuration: cartItemConfigurationType): orderCuttingExportDownloadFileType[] =>
  configuration.logo.instances
    .filter((instance) => !instance.isDefault && instance.src.trim())
    .map((instance) => ({
      key: `logo-${instance.id}`,
      label: instance.label || instance.fileName || 'Logo',
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
      const details = buildTextInstancesDetails(configuration.name.instances, model);
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
      const details = buildTextInstancesDetails(configuration.number.instances, model);
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
      const details = buildTextInstancesDetails(configuration.testo.instances, model);
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
          instance.naturalWidth > 0 ? { label: 'File originale', value: `${instance.naturalWidth}×${instance.naturalHeight}px` } : null,
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

const buildOrderCuttingExportSteps = (configuration: cartItemConfigurationType, model: garmentConfigType): orderCuttingExportConfigurationStepType[] =>
  CONFIGURATOR_STEP_META.filter((meta) => !model.hiddenSteps?.includes(meta.value)).map((meta) => buildStep(meta.value, configuration, model));

export { buildOrderCuttingExportSteps };
