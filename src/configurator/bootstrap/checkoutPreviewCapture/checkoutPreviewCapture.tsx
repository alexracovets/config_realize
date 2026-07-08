'use client';

import { SceneModel } from '@configurator/canvas/SceneModel';
import { isGarmentModelReadyForProduct, prepareGarmentModel } from '@configurator/bootstrap/prepareGarmentModel';
import { captureConfiguratorPreview } from '@configurator/bootstrap/previewCapture/captureConfiguratorPreview';
import { waitForPresenterFrames } from '@configurator/utils';
import { Environment } from '@react-three/drei';
import { Canvas, useThree } from '@react-three/fiber';
import { applyGarmentConfiguration } from '@store/useConfigurationCart/cartItemConfiguration';
import { useConfigurationCart, useConfiguratorProduct, useConfiguratorSceneLoad } from '@store';
import { ACESFilmicToneMapping } from 'three';
import { Suspense, useCallback, useEffect, useRef } from 'react';

const CHECKOUT_PREVIEW_CAPTURE_DEBOUNCE_MS = 400;

type checkoutPreviewCaptureListenerType = (cartItemId: string) => void;

const listeners = new Set<checkoutPreviewCaptureListenerType>();
const pendingTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

const scheduleCheckoutPreviewCapture = (cartItemId: string) => {
  const existingTimeout = pendingTimeouts.get(cartItemId);
  if (existingTimeout) clearTimeout(existingTimeout);

  pendingTimeouts.set(
    cartItemId,
    setTimeout(() => {
      pendingTimeouts.delete(cartItemId);
      listeners.forEach((listener) => listener(cartItemId));
    }, CHECKOUT_PREVIEW_CAPTURE_DEBOUNCE_MS),
  );
};

const useCheckoutItemPreviewCapture = () => {
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);
  const camera = useThree((state) => state.camera);
  const invalidate = useThree((state) => state.invalidate);
  const captureGenerationRef = useRef(0);

  const captureCartItemPreview = useCallback(
    async (cartItemId: string) => {
      const generation = ++captureGenerationRef.current;
      const cart = useConfigurationCart.getState();
      const cartItem = cart.items.find((item) => item.id === cartItemId);
      if (!cartItem) return;

      useConfiguratorProduct.getState().setProduct(cartItem.modelId, cartItem.business);
      const product = useConfiguratorProduct.getState().product;

      const configuration = cart.getConfiguration(cartItemId);
      if (!configuration) return;

      if (!isGarmentModelReadyForProduct(product)) {
        await prepareGarmentModel(product, { configuration }).catch(() => undefined);
      }

      if (generation !== captureGenerationRef.current) return;

      applyGarmentConfiguration(product, configuration);
      await waitForPresenterFrames(invalidate, 6);

      if (generation !== captureGenerationRef.current) return;

      const preview = captureConfiguratorPreview({ gl, scene, camera });
      if (preview) cart.savePreview(cartItemId, preview);
      invalidate();
    },
    [camera, gl, invalidate, scene],
  );

  useEffect(() => {
    const listener = (cartItemId: string) => void captureCartItemPreview(cartItemId);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, [captureCartItemPreview]);
};

const CheckoutPreviewSceneControl = () => {
  useCheckoutItemPreviewCapture();

  return (
    <>
      <ambientLight intensity={1.5} />
      <directionalLight position={[2, 4, 3]} intensity={0.1} />
      <directionalLight position={[-2, 1, -1]} intensity={0.1} />
      <Environment preset="studio" environmentIntensity={0.2} background={false} />
    </>
  );
};

const CheckoutPreviewCaptureHost = () => {
  useEffect(() => {
    useConfiguratorSceneLoad.getState().markRouteHydrated();
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed top-0 left-[-9999px] h-[700px] w-[800px] overflow-hidden opacity-0">
      <Canvas
        camera={{ position: [0, 0, 3], fov: 45 }}
        style={{ width: '100%', height: '100%' }}
        frameloop="demand"
        gl={{
          alpha: true,
          antialias: true,
          logarithmicDepthBuffer: true,
          powerPreference: 'high-performance',
          preserveDrawingBuffer: true,
          stencil: true,
          toneMapping: ACESFilmicToneMapping,
          toneMappingExposure: 0.72,
        }}
        dpr={[1, 2]}
        onCreated={({ gl, scene, invalidate }) => {
          scene.background = null;
          gl.setClearColor(0x000000, 0);
          gl.debug.checkShaderErrors = false;
          requestAnimationFrame(() => invalidate());
        }}
      >
        <CheckoutPreviewSceneControl />
        <Suspense fallback={null}>
          <SceneModel />
        </Suspense>
      </Canvas>
    </div>
  );
};

export { CheckoutPreviewCaptureHost, scheduleCheckoutPreviewCapture };
