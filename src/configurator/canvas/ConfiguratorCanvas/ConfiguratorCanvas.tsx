'use client';

import { CanvasControl, SceneModel } from '@configurator/canvas';
import { Canvas } from '@react-three/fiber';
import { ACESFilmicToneMapping } from 'three';
import { useConfiguratorSceneLoad } from '@store';
import { Suspense, useState } from 'react';

const ConfiguratorCanvas = () => {
  const [canvasKey, setCanvasKey] = useState(0);
  const sceneRouteKey = useConfiguratorSceneLoad((state) => state.sceneRouteKey);
  const isInitialSceneLoading = useConfiguratorSceneLoad((state) => state.isInitialSceneLoading);
  const isSceneTransitionLoading = useConfiguratorSceneLoad((state) => state.isSceneTransitionLoading);
  const useContinuousFrameLoop = isInitialSceneLoading || isSceneTransitionLoading;

  return (
    <Canvas
      key={`${sceneRouteKey}:${canvasKey}`}
      camera={{ position: [0, 0, 3], fov: 45 }}
      style={{ width: '100%', height: '100%' }}
      frameloop={useContinuousFrameLoop ? 'always' : 'demand'}
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
        const canvas = gl.domElement;

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
      <Suspense fallback={null}>
        <SceneModel />
      </Suspense>
    </Canvas>
  );
};

export { ConfiguratorCanvas };
