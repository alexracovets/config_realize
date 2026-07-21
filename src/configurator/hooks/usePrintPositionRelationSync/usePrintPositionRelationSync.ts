'use client';

import { useEffect } from 'react';

import {
  syncPrintPositionRelationsForFollower,
  syncPrintPositionRelationsForLeader,
  syncPrintPositionRelationsPreviewForFollower,
  syncPrintPositionRelationsPreviewForLeader,
} from '@configurator/hooks/syncPrintPositionRelations';
import { useGarmentName, useGarmentNumber, useGarmentTesto } from '@store';

type printInstanceSnapshotType = {
  id: string;
  uv: { x: number; y: number };
  fontSize: number;
  text: string;
  rotation: number;
};

const didInstanceChange = (prev: printInstanceSnapshotType | undefined, next: printInstanceSnapshotType) => {
  if (!prev) return true;
  return (
    prev.uv.x !== next.uv.x ||
    prev.uv.y !== next.uv.y ||
    prev.fontSize !== next.fontSize ||
    prev.rotation !== next.rotation ||
    prev.text !== next.text
  );
};

const toSnapshot = (instance: { id: string; uv: { x: number; y: number }; fontSize: number; text: string; rotation: number }): printInstanceSnapshotType => ({
  id: instance.id,
  uv: { ...instance.uv },
  fontSize: instance.fontSize,
  text: instance.text,
  rotation: instance.rotation,
});

const usePrintPositionRelationSync = () => {
  useEffect(() => {
    let previousNames = useGarmentName.getState().instances.map(toSnapshot);
    let previousNumbers = useGarmentNumber.getState().instances.map(toSnapshot);
    let previousTestos = useGarmentTesto.getState().instances.map(toSnapshot);
    let previousNamePreview = useGarmentName.getState().preview;
    let previousNumberPreview = useGarmentNumber.getState().preview;
    let previousTestoPreview = useGarmentTesto.getState().preview;
    let syncing = false;

    const runSync = (fn: () => void) => {
      if (syncing) return;
      syncing = true;
      try {
        fn();
      } finally {
        syncing = false;
      }
    };

    const unsubName = useGarmentName.subscribe((state) => {
      const next = state.instances.map(toSnapshot);
      const changed = state.instances.filter((instance) => didInstanceChange(previousNames.find((item) => item.id === instance.id), toSnapshot(instance)));
      previousNames = next;

      runSync(() => {
        for (const instance of changed) syncPrintPositionRelationsForLeader('name', instance);
      });
    });

    const unsubNamePreview = useGarmentName.subscribe((state) => {
      const preview = state.preview;
      const changed = preview !== previousNamePreview;
      previousNamePreview = preview;
      if (!changed || !preview) return;

      runSync(() => syncPrintPositionRelationsPreviewForLeader('name', preview.instanceId));
    });

    const unsubNumber = useGarmentNumber.subscribe((state) => {
      const next = state.instances.map(toSnapshot);
      const changed = state.instances.filter((instance) => didInstanceChange(previousNumbers.find((item) => item.id === instance.id), toSnapshot(instance)));
      previousNumbers = next;

      runSync(() => {
        for (const instance of changed) syncPrintPositionRelationsForLeader('number', instance);
      });
    });

    const unsubNumberPreview = useGarmentNumber.subscribe((state) => {
      const preview = state.preview;
      const changed = preview !== previousNumberPreview;
      previousNumberPreview = preview;
      if (!changed || !preview) return;

      runSync(() => syncPrintPositionRelationsPreviewForLeader('number', preview.instanceId));
    });

    const unsubTesto = useGarmentTesto.subscribe((state) => {
      const next = state.instances.map(toSnapshot);
      const changed = state.instances.filter((instance) => didInstanceChange(previousTestos.find((item) => item.id === instance.id), toSnapshot(instance)));
      previousTestos = next;

      runSync(() => {
        for (const instance of changed) syncPrintPositionRelationsForFollower(instance.id);
      });
    });

    const unsubTestoPreview = useGarmentTesto.subscribe((state) => {
      const preview = state.preview;
      const changed = preview !== previousTestoPreview;
      previousTestoPreview = preview;
      if (!changed || !preview) return;

      runSync(() => syncPrintPositionRelationsPreviewForFollower(preview.instanceId));
    });

    return () => {
      unsubName();
      unsubNamePreview();
      unsubNumber();
      unsubNumberPreview();
      unsubTesto();
      unsubTestoPreview();
    };
  }, []);
};

export { usePrintPositionRelationSync };
