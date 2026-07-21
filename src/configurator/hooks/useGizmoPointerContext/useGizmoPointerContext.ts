'use client';

import { useThree } from '@react-three/fiber';

const useGizmoPointerContext = () => {
  const raycaster = useThree((state) => state.raycaster);
  const camera = useThree((state) => state.camera);
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);
  const invalidate = useThree((state) => state.invalidate);
  const controls = useThree((state) => state.controls) as {
    addEventListener: (type: string, listener: () => void) => void;
    removeEventListener: (type: string, listener: () => void) => void;
    enabled: boolean;
  } | null;

  return { raycaster, camera, gl, scene, invalidate, controls };
};

export { useGizmoPointerContext };
