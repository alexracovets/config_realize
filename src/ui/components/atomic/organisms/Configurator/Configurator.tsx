'use client';

import { Suspense, useState } from 'react';

import { Canvas } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import * as THREE from 'three';

import { suppressThreeClockDeprecation } from '@utils';

import { CanvasControl } from './CanvasControl';
import { Model } from './Model';

suppressThreeClockDeprecation();

const Configurator = () => {
  const [canvasKey, setCanvasKey] = useState(0);

  return (
    <Canvas
      key={canvasKey}
      camera={{ position: [0, 0, 3], fov: 45 }}
      style={{ width: '100%', height: '100%' }}
      frameloop="demand"
      gl={{
        antialias: true,
        logarithmicDepthBuffer: true,
        powerPreference: 'high-performance',
        preserveDrawingBuffer: true,
        stencil: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.12,
      }}
      dpr={[1, 1.5]}
      onCreated={({ gl }) => {
        const canvas = gl.domElement;

        canvas.addEventListener('webglcontextlost', (event) => {
          event.preventDefault();
        });

        canvas.addEventListener('webglcontextrestored', () => {
          setCanvasKey((currentKey) => currentKey + 1);
        });
      }}
    >
      <CanvasControl />
      <Environment preset="sunset" environmentIntensity={.1} />
      <Suspense fallback={null}>
        <Model />
      </Suspense>
    </Canvas>
  );
};

export { Configurator };
