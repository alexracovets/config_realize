'use client';

import { memo, useEffect, useMemo } from 'react';

import { buildLogoGizmoElements, buildNameGizmoElements, buildNumberGizmoElements, buildPrintablePartMeshes, buildTestoGizmoElements } from '@gizmo';
import { useGizmoButtonHover, useGizmoSelection } from '@hooks';
import {
  resolveNameLimits,
  resolveNumberLimits,
  resolveTestoLimits,
  useConfigurationControl,
  useConfiguratorProduct,
  useGarmentLogo,
  useGarmentName,
  useGarmentNumber,
  useGarmentTesto,
} from '@store';
import { repairPrintInstancePlacement, resolvePrintAtlasSize } from '@utils';

import { PrintGizmoInstance } from './PrintGizmoInstance';

const NAME_STEP = 4;
const NUMBER_STEP = 5;
const TESTO_STEP = 6;
const LOGO_STEP = 7;

const PrintGizmoLayer = memo(() => {
  const product = useConfiguratorProduct((state) => state.product);
  const activeStep = useConfigurationControl((state) => state.activeStep);

  const nameInstances = useGarmentName((state) => state.instances);
  const nameSelectedInstanceId = useGarmentName((state) => state.selectedInstanceId);
  const setNameSelectedInstance = useGarmentName((state) => state.setSelectedInstance);
  const clearNameSelectedInstance = useGarmentName((state) => state.clearSelectedInstance);
  const bringNameInstanceToFront = useGarmentName((state) => state.bringInstanceToFront);

  const numberInstances = useGarmentNumber((state) => state.instances);
  const numberSelectedInstanceId = useGarmentNumber((state) => state.selectedInstanceId);
  const setNumberSelectedInstance = useGarmentNumber((state) => state.setSelectedInstance);
  const clearNumberSelectedInstance = useGarmentNumber((state) => state.clearSelectedInstance);
  const bringNumberInstanceToFront = useGarmentNumber((state) => state.bringInstanceToFront);

  const testoInstances = useGarmentTesto((state) => state.instances);
  const testoSelectedInstanceId = useGarmentTesto((state) => state.selectedInstanceId);
  const setTestoSelectedInstance = useGarmentTesto((state) => state.setSelectedInstance);
  const clearTestoSelectedInstance = useGarmentTesto((state) => state.clearSelectedInstance);
  const bringTestoInstanceToFront = useGarmentTesto((state) => state.bringInstanceToFront);

  const logoInstances = useGarmentLogo((state) => state.instances);
  const logoSelectedInstanceId = useGarmentLogo((state) => state.selectedInstanceId);
  const setLogoSelectedInstance = useGarmentLogo((state) => state.setSelectedInstance);
  const clearLogoSelectedInstance = useGarmentLogo((state) => state.clearSelectedInstance);
  const bringLogoInstanceToFront = useGarmentLogo((state) => state.bringInstanceToFront);

  const nameLimits = useMemo(() => (product.nameDefaults ? resolveNameLimits(product) : null), [product]);
  const numberLimits = useMemo(() => (product.numberDefaults ? resolveNumberLimits(product) : null), [product]);
  const testoLimits = useMemo(() => (product.testoDefaults ? resolveTestoLimits(product) : null), [product]);

  const gizmoStep =
    activeStep === NAME_STEP
      ? NAME_STEP
      : activeStep === NUMBER_STEP
        ? NUMBER_STEP
        : activeStep === TESTO_STEP
          ? TESTO_STEP
          : activeStep === LOGO_STEP
            ? LOGO_STEP
            : null;

  const nameInstancesForGizmo = useMemo(
    () => nameInstances.map((instance) => repairPrintInstancePlacement(instance, product.parts)),
    [nameInstances, product.parts],
  );
  const numberInstancesForGizmo = useMemo(
    () => numberInstances.map((instance) => repairPrintInstancePlacement(instance, product.parts)),
    [numberInstances, product.parts],
  );
  const testoInstancesForGizmo = useMemo(
    () => testoInstances.map((instance) => repairPrintInstancePlacement(instance, product.parts)),
    [testoInstances, product.parts],
  );
  const logoInstancesForGizmo = useMemo(
    () => logoInstances.map((instance) => repairPrintInstancePlacement(instance, product.parts)),
    [logoInstances, product.parts],
  );

  useEffect(() => {
    if (activeStep !== NAME_STEP) return;

    nameInstances.forEach((instance) => {
      const repaired = repairPrintInstancePlacement(instance, product.parts);
      const needsPlacementMigration = instance.placementRotation === undefined && instance.rotation !== 0;
      const needsUvRepair = repaired.partId !== instance.partId || repaired.uv.x !== instance.uv.x || repaired.uv.y !== instance.uv.y;

      if (!needsPlacementMigration && !needsUvRepair) return;

      useGarmentName.getState().updateInstance(instance.id, {
        ...(needsUvRepair ? { partId: repaired.partId, uv: repaired.uv } : {}),
        ...(needsPlacementMigration ? { placementRotation: instance.rotation, rotation: 0 } : {}),
      });
    });
  }, [activeStep, nameInstances, product.parts]);

  useEffect(() => {
    if (activeStep !== NUMBER_STEP) return;

    numberInstances.forEach((instance) => {
      const repaired = repairPrintInstancePlacement(instance, product.parts);
      const needsPlacementMigration = instance.placementRotation === undefined && instance.rotation !== 0;
      const needsUvRepair = repaired.partId !== instance.partId || repaired.uv.x !== instance.uv.x || repaired.uv.y !== instance.uv.y;

      if (!needsPlacementMigration && !needsUvRepair) return;

      useGarmentNumber.getState().updateInstance(instance.id, {
        ...(needsUvRepair ? { partId: repaired.partId, uv: repaired.uv } : {}),
        ...(needsPlacementMigration ? { placementRotation: instance.rotation, rotation: 0 } : {}),
      });
    });
  }, [activeStep, numberInstances, product.parts]);

  useEffect(() => {
    if (activeStep !== TESTO_STEP) return;

    testoInstances.forEach((instance) => {
      const repaired = repairPrintInstancePlacement(instance, product.parts);
      const needsPlacementMigration = instance.placementRotation === undefined && instance.rotation !== 0;
      const needsUvRepair = repaired.partId !== instance.partId || repaired.uv.x !== instance.uv.x || repaired.uv.y !== instance.uv.y;

      if (!needsPlacementMigration && !needsUvRepair) return;

      useGarmentTesto.getState().updateInstance(instance.id, {
        ...(needsUvRepair ? { partId: repaired.partId, uv: repaired.uv } : {}),
        ...(needsPlacementMigration ? { placementRotation: instance.rotation, rotation: 0 } : {}),
      });
    });
  }, [activeStep, testoInstances, product.parts]);

  useEffect(() => {
    if (activeStep !== LOGO_STEP) return;

    logoInstances.forEach((instance) => {
      const repaired = repairPrintInstancePlacement(instance, product.parts);
      if (repaired.partId === instance.partId && repaired.uv.x === instance.uv.x && repaired.uv.y === instance.uv.y) return;

      useGarmentLogo.getState().updateInstance(instance.id, { partId: repaired.partId, uv: repaired.uv });
    });
  }, [activeStep, logoInstances, product.parts]);

  const elements = useMemo(() => {
    if (activeStep === NAME_STEP && nameLimits) {
      return buildNameGizmoElements({
        product,
        instances: nameInstancesForGizmo,
        fontSizeMin: nameLimits.fontSizeMin,
        fontSizeMax: nameLimits.fontSizeMax,
      });
    }
    if (activeStep === NUMBER_STEP && numberLimits) {
      return buildNumberGizmoElements({
        product,
        instances: numberInstancesForGizmo,
        fontSizeMin: numberLimits.fontSizeMin,
        fontSizeMax: numberLimits.fontSizeMax,
      });
    }
    if (activeStep === TESTO_STEP && testoLimits) {
      return buildTestoGizmoElements({
        product,
        instances: testoInstancesForGizmo,
        fontSizeMin: testoLimits.fontSizeMin,
        fontSizeMax: testoLimits.fontSizeMax,
      });
    }
    if (activeStep === LOGO_STEP) {
      return buildLogoGizmoElements({ product, instances: logoInstancesForGizmo });
    }
    return [];
  }, [
    activeStep,
    logoInstancesForGizmo,
    nameInstancesForGizmo,
    nameLimits,
    numberInstancesForGizmo,
    numberLimits,
    product,
    testoInstancesForGizmo,
    testoLimits,
  ]);

  const selectedInstanceId =
    activeStep === NAME_STEP
      ? nameSelectedInstanceId
      : activeStep === NUMBER_STEP
        ? numberSelectedInstanceId
        : activeStep === TESTO_STEP
          ? testoSelectedInstanceId
          : activeStep === LOGO_STEP
            ? logoSelectedInstanceId
            : null;

  const selectionStore = useMemo(() => {
    if (activeStep === NUMBER_STEP) {
      return {
        selectedInstanceId: numberSelectedInstanceId,
        setSelectedInstance: setNumberSelectedInstance,
        clearSelectedInstance: clearNumberSelectedInstance,
        bringInstanceToFront: bringNumberInstanceToFront,
      };
    }
    if (activeStep === TESTO_STEP) {
      return {
        selectedInstanceId: testoSelectedInstanceId,
        setSelectedInstance: setTestoSelectedInstance,
        clearSelectedInstance: clearTestoSelectedInstance,
        bringInstanceToFront: bringTestoInstanceToFront,
      };
    }
    if (activeStep === LOGO_STEP) {
      return {
        selectedInstanceId: logoSelectedInstanceId,
        setSelectedInstance: setLogoSelectedInstance,
        clearSelectedInstance: clearLogoSelectedInstance,
        bringInstanceToFront: bringLogoInstanceToFront,
      };
    }
    return {
      selectedInstanceId: nameSelectedInstanceId,
      setSelectedInstance: setNameSelectedInstance,
      clearSelectedInstance: clearNameSelectedInstance,
      bringInstanceToFront: bringNameInstanceToFront,
    };
  }, [
    activeStep,
    bringLogoInstanceToFront,
    bringNameInstanceToFront,
    bringNumberInstanceToFront,
    bringTestoInstanceToFront,
    clearLogoSelectedInstance,
    clearNameSelectedInstance,
    clearNumberSelectedInstance,
    clearTestoSelectedInstance,
    logoSelectedInstanceId,
    nameSelectedInstanceId,
    numberSelectedInstanceId,
    setLogoSelectedInstance,
    setNameSelectedInstance,
    setNumberSelectedInstance,
    setTestoSelectedInstance,
    testoSelectedInstanceId,
  ]);

  const atlasSize = useMemo(() => resolvePrintAtlasSize(product), [product]);
  const printableParts = useMemo(() => buildPrintablePartMeshes(product.parts), [product.parts]);

  useEffect(() => {
    if (activeStep !== NAME_STEP) clearNameSelectedInstance();
  }, [activeStep, clearNameSelectedInstance]);

  useEffect(() => {
    if (activeStep !== NUMBER_STEP) clearNumberSelectedInstance();
  }, [activeStep, clearNumberSelectedInstance]);

  useEffect(() => {
    if (activeStep !== TESTO_STEP) clearTestoSelectedInstance();
  }, [activeStep, clearTestoSelectedInstance]);

  useEffect(() => {
    if (activeStep !== LOGO_STEP) clearLogoSelectedInstance();
  }, [activeStep, clearLogoSelectedInstance]);

  useGizmoSelection({ elements, atlasSize, gizmoStep, store: selectionStore });
  useGizmoButtonHover({ elements, atlasSize, gizmoStep, selectedInstanceId });

  if (elements.length === 0) return null;

  return (
    <group>
      {elements.map((element) => (
        <PrintGizmoInstance
          key={element.id}
          element={element}
          elements={elements}
          printableParts={printableParts}
          gizmoStep={gizmoStep}
          selectedInstanceId={selectedInstanceId}
        />
      ))}
    </group>
  );
});

PrintGizmoLayer.displayName = 'PrintGizmoLayer';

export { PrintGizmoLayer };
