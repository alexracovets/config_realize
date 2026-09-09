import type { cartItemConfigurationType, garmentBusinessType, modelIdType } from '@types';

const SHARE_CONFIG_EXPORT_VERSION = 1;
const SHARE_CONFIG_EXPORT_KIND = 'share' as const;

type shareConfigExportType = {
  kind: typeof SHARE_CONFIG_EXPORT_KIND;
  version: number;
  createdAt: string;

  collectionHandle: string;
  slug: string;
  modelId: modelIdType;

  business: garmentBusinessType;

  configuration: cartItemConfigurationType;
};

type buildShareConfigExportArgsType = {
  collectionHandle: string;
  slug: string;
  modelId: modelIdType;
  business: garmentBusinessType;
  configuration: cartItemConfigurationType;
  createdAt?: string;
};

const buildShareConfigExport = ({
  collectionHandle,
  slug,
  modelId,
  business,
  configuration,
  createdAt,
}: buildShareConfigExportArgsType): shareConfigExportType => ({
  kind: SHARE_CONFIG_EXPORT_KIND,
  version: SHARE_CONFIG_EXPORT_VERSION,
  createdAt: createdAt ?? new Date().toISOString(),
  collectionHandle,
  slug,
  modelId,
  business,
  configuration,
});

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

const parseShareConfigExport = (value: unknown): shareConfigExportType | null => {
  if (!isRecord(value)) {
    return null;
  }

  const { kind, version, collectionHandle, slug, modelId, business, configuration } = value;

  if (kind !== SHARE_CONFIG_EXPORT_KIND || version !== SHARE_CONFIG_EXPORT_VERSION) {
    return null;
  }

  if (typeof collectionHandle !== 'string' || typeof slug !== 'string' || typeof modelId !== 'string') {
    return null;
  }

  if (!isRecord(business) || !isRecord(configuration)) {
    return null;
  }

  return value as shareConfigExportType;
};

export { buildShareConfigExport, parseShareConfigExport, SHARE_CONFIG_EXPORT_KIND, SHARE_CONFIG_EXPORT_VERSION };
export type { shareConfigExportType };
