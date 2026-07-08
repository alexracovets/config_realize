'use client';

import type { garmentConfigType, garmentLogoSnapshotType, logoInstanceType } from '@types';
import { createDefaultLogoInstances, createLogoInstance, mapProductLogoPositions } from '@store/useGarmentLogo';

const createInheritedLogoId = (positionKey: string) => `${positionKey}_inherited_${crypto.randomUUID()}`;

const isCustomizedLogo = (reference: logoInstanceType, catalogDefaultSrc?: string) =>
  !reference.isDefault || (catalogDefaultSrc !== undefined && reference.src !== catalogDefaultSrc);

const inheritLogoSnapshot = (referenceSnapshot: garmentLogoSnapshotType, newProduct: garmentConfigType): garmentLogoSnapshotType => {
  const newPositions = mapProductLogoPositions(newProduct);
  const positionsByLabel = new Map(newPositions.map((position) => [position.label, position]));
  const coveredPositionKeys = new Set<string>();
  const instances: logoInstanceType[] = [];

  for (const reference of referenceSnapshot.instances) {
    const position = positionsByLabel.get(reference.label);
    if (!position) continue;

    coveredPositionKeys.add(position.key);

    if (!isCustomizedLogo(reference, position.src)) {
      const [defaultInstance] = createDefaultLogoInstances([position]);
      if (defaultInstance) instances.push(defaultInstance);
      continue;
    }

    instances.push({
      ...createLogoInstance(position, createInheritedLogoId(position.key), {
        src: reference.src,
        fileName: reference.fileName,
        isDefault: reference.isDefault,
        naturalWidth: reference.naturalWidth,
        naturalHeight: reference.naturalHeight,
        uploadRotation: reference.uploadRotation,
      }),
      rotation: reference.rotation,
      scale: reference.scale,
      opacity: reference.opacity,
    });
  }

  for (const defaultInstance of createDefaultLogoInstances(newPositions)) {
    if (!coveredPositionKeys.has(defaultInstance.positionKey)) {
      instances.push(defaultInstance);
    }
  }

  const selectedReference = referenceSnapshot.instances.find((instance) => instance.id === referenceSnapshot.selectedInstanceId);
  const selectedInstanceId = selectedReference ? (instances.find((instance) => instance.label === selectedReference.label)?.id ?? null) : null;

  return { instances, selectedInstanceId };
};

export { inheritLogoSnapshot };
