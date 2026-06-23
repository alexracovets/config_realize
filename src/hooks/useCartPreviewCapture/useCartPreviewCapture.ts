'use client';

import { useCallback, useEffect, useRef } from 'react';

import { useThree } from '@react-three/fiber';

import { captureConfiguratorPreview, registerConfiguratorPreviewCapture, unregisterConfiguratorPreviewCapture } from '@utils';
import {
  useConfigurationCart,
  useConfiguratorProduct,
  useConfiguratorSceneLoad,
  useGarmentColor,
  useGarmentDesign,
  useGarmentLogo,
  useGarmentName,
  useGarmentNumber,
  useGarmentTesto,
} from '@store';

const PREVIEW_CAPTURE_DEBOUNCE_MS = 400;

const useCartPreviewCapture = () => {
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);
  const camera = useThree((state) => state.camera);
  const invalidate = useThree((state) => state.invalidate);
  const activeItemId = useConfigurationCart((state) => state.activeItemId);
  const savePreview = useConfigurationCart((state) => state.savePreview);
  const isInitialSceneLoading = useConfiguratorSceneLoad((state) => state.isInitialSceneLoading);
  const isSceneTransitionLoading = useConfiguratorSceneLoad((state) => state.isSceneTransitionLoading);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const capture = useCallback(() => {
    return captureConfiguratorPreview({
      gl,
      scene,
      camera,
    });
  }, [camera, gl, scene]);

  const persistActivePreview = useCallback(() => {
    const preview = capture();
    if (preview) savePreview(activeItemId, preview);
    invalidate();
  }, [activeItemId, capture, invalidate, savePreview]);

  useEffect(() => {
    registerConfiguratorPreviewCapture(capture);
    return () => unregisterConfiguratorPreviewCapture();
  }, [capture]);

  useEffect(() => {
    if (isInitialSceneLoading || isSceneTransitionLoading) return;

    const scheduleCapture = () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);

      debounceRef.current = setTimeout(() => {
        persistActivePreview();
        debounceRef.current = null;
      }, PREVIEW_CAPTURE_DEBOUNCE_MS);
    };

    const unsubscribes = [
      useGarmentColor.subscribe(scheduleCapture),
      useGarmentDesign.subscribe(scheduleCapture),
      useGarmentName.subscribe(scheduleCapture),
      useGarmentNumber.subscribe(scheduleCapture),
      useGarmentTesto.subscribe(scheduleCapture),
      useGarmentLogo.subscribe(scheduleCapture),
      useConfiguratorProduct.subscribe(scheduleCapture),
    ];

    scheduleCapture();

    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe());
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
    };
  }, [activeItemId, isInitialSceneLoading, isSceneTransitionLoading, persistActivePreview]);
};

export { useCartPreviewCapture };
