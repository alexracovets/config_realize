'use client';

import type { garmentConfigType } from '@types';

type textPrintSnapshotType<TInstance extends { id: string; label: string }> = {
  instances: TInstance[];
  selectedInstanceId: string | null;
};

type textPrintPositionType = {
  key: string;
  label: string;
};

const createInheritedInstanceId = (positionKey: string) => `${positionKey}_inherited_${crypto.randomUUID()}`;

const inheritTextPrintSnapshot = <TInstance extends { id: string; label: string }, TPosition extends textPrintPositionType>(
  referenceSnapshot: textPrintSnapshotType<TInstance>,
  newProduct: garmentConfigType,
  mapPositions: (product: garmentConfigType) => TPosition[],
  createInstance: (product: garmentConfigType, position: TPosition, id: string) => TInstance,
  mergeContent: (created: TInstance, reference: TInstance) => TInstance,
): textPrintSnapshotType<TInstance> => {
  const positionsByLabel = new Map(mapPositions(newProduct).map((position) => [position.label, position]));
  const instances: TInstance[] = [];

  for (const reference of referenceSnapshot.instances) {
    const position = positionsByLabel.get(reference.label);
    if (!position) continue;

    instances.push(mergeContent(createInstance(newProduct, position, createInheritedInstanceId(position.key)), reference));
  }

  const selectedReference = referenceSnapshot.instances.find((instance) => instance.id === referenceSnapshot.selectedInstanceId);
  const selectedInstanceId = selectedReference ? (instances.find((instance) => instance.label === selectedReference.label)?.id ?? null) : null;

  return { instances, selectedInstanceId };
};

export { inheritTextPrintSnapshot };
