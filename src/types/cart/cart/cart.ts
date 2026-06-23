import type { garmentBusinessType, logoInstanceType, modelIdType, nameInstanceType, numberInstanceType, partGradientType, productCollectionIdType, testoInstanceType } from '@types';

interface cartItemType {
  id: string;
  collection: productCollectionIdType;
  slug: string;
  /** Local geometry model id (== Shopify `custom.id`). */
  modelId: modelIdType;
  /** Snapshot of Shopify business data (price/bonus/name) at the time the item was added. */
  business: garmentBusinessType;
}

interface garmentColorSnapshotType {
  byPart: Record<string, string>;
  gradientsByPart: Record<string, partGradientType>;
}

interface garmentDesignSnapshotType {
  activePatternKey: string | null;
  patternColors: Record<string, string>;
  designLayerColors: Record<number, string>;
  activeOpacity: number;
  designOpacity: number;
}

interface garmentNameSnapshotType {
  instances: nameInstanceType[];
  selectedInstanceId: string | null;
}

interface garmentNumberSnapshotType {
  instances: numberInstanceType[];
  selectedInstanceId: string | null;
}

interface garmentTestoSnapshotType {
  instances: testoInstanceType[];
  selectedInstanceId: string | null;
}

interface garmentLogoSnapshotType {
  instances: logoInstanceType[];
  selectedInstanceId: string | null;
}

interface cartItemConfigurationType {
  color: garmentColorSnapshotType;
  design: garmentDesignSnapshotType;
  name: garmentNameSnapshotType;
  number: garmentNumberSnapshotType;
  testo: garmentTestoSnapshotType;
  logo: garmentLogoSnapshotType;
}

export type {
  cartItemType,
  cartItemConfigurationType,
  garmentColorSnapshotType,
  garmentDesignSnapshotType,
  garmentLogoSnapshotType,
  garmentNameSnapshotType,
  garmentNumberSnapshotType,
  garmentTestoSnapshotType,
};
