'use client';

import { CanvasControl } from '@configurator/canvas/CanvasControl';
import { SceneDebugBridge, SceneDebugOverlay } from '@configurator/canvas/SceneDebugOverlay';
import { SceneModel } from '@configurator/canvas/SceneModel';
import { Canvas } from '@react-three/fiber';
import { ACESFilmicToneMapping } from 'three';
import { useConfiguratorSceneLoad } from '@store';
import { Suspense, useState } from 'react';

const clearTextSelection = () => {
  window.getSelection()?.removeAllRanges();
};

const ConfiguratorCanvas = () => {
  const [canvasKey, setCanvasKey] = useState(0);
  const sceneRouteKey = useConfiguratorSceneLoad((state) => state.sceneRouteKey);
  const isInitialSceneLoading = useConfiguratorSceneLoad((state) => state.isInitialSceneLoading);
  const isSceneTransitionLoading = useConfiguratorSceneLoad((state) => state.isSceneTransitionLoading);
  const useContinuousFrameLoop = isInitialSceneLoading || isSceneTransitionLoading;

  return (
    <>
      <SceneDebugOverlay />
      <Canvas
        key={`${sceneRouteKey}:${canvasKey}`}
        camera={{ position: [0, 0, 3], fov: 45 }}
        style={{ width: '100%', height: '100%', touchAction: 'none' }}
        frameloop={useContinuousFrameLoop ? 'always' : 'demand'}
        onPointerEnter={clearTextSelection}
        onPointerDown={clearTextSelection}
        gl={{
          alpha: true,
          antialias: true,
          logarithmicDepthBuffer: false,
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
          gl.debug.checkShaderErrors = Boolean(navigator.webdriver);
          requestAnimationFrame(() => invalidate());
          const canvas = gl.domElement;
          canvas.setAttribute('data-testid', 'configurator-canvas');
          canvas.removeAttribute('tabindex');
          new MutationObserver(() => {
            if (canvas.hasAttribute('tabindex')) canvas.removeAttribute('tabindex');
          }).observe(canvas, { attributes: true, attributeFilter: ['tabindex'] });

          canvas.addEventListener('webglcontextlost', (event) => {
            event.preventDefault();
            useConfiguratorSceneLoad.getState().beginInitialSceneLoad();
            setCanvasKey((currentKey) => currentKey + 1);
          });

          canvas.addEventListener('webglcontextrestored', () => {
            setCanvasKey((currentKey) => currentKey + 1);
          });
        }}
      >
        <CanvasControl />
        <SceneDebugBridge />
        <Suspense fallback={null}>
          <SceneModel />
        </Suspense>
      </Canvas>
    </>
  );
};

export { ConfiguratorCanvas };
