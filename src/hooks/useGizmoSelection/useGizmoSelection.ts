'use client';

import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';

import { clearGizmoButtonHover, resolveGizmoPointerTarget } from '@gizmo';
import type { printGizmoElementType } from '@types';

interface GizmoSelectionStore {
  selectedInstanceId: string | null;
  setSelectedInstance: (id: string) => void;
  clearSelectedInstance: () => void;
  bringInstanceToFront: (id: string) => void;
}

interface UseGizmoSelectionOptions {
  elements: printGizmoElementType[];
  atlasSize: { width: number; height: number };
  gizmoStep: number | null;
  store: GizmoSelectionStore;
}

const useGizmoSelection = ({ elements, atlasSize, gizmoStep, store }: UseGizmoSelectionOptions) => {
  const { selectedInstanceId, setSelectedInstance, clearSelectedInstance, bringInstanceToFront } = store;

  const raycaster = useThree((state) => state.raycaster);
  const camera = useThree((state) => state.camera);
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);
  const controls = useThree((state) => state.controls) as {
    addEventListener: (type: string, listener: () => void) => void;
    removeEventListener: (type: string, listener: () => void) => void;
  } | null;
  const invalidate = useThree((state) => state.invalidate);

  const ctx = useRef({
    elements,
    atlasSize,
    gizmoStep,
    selectedInstanceId,
    raycaster,
    camera,
    gl,
    scene,
    setSelectedInstance,
    clearSelectedInstance,
    bringInstanceToFront,
    invalidate,
  });

  useEffect(() => {
    ctx.current = {
      elements,
      atlasSize,
      gizmoStep,
      selectedInstanceId,
      raycaster,
      camera,
      gl,
      scene,
      setSelectedInstance,
      clearSelectedInstance,
      bringInstanceToFront,
      invalidate,
    };
  });

  useEffect(() => {
    const dom = gl.domElement;

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      if (ctx.current.gizmoStep === null) return;

      const target = resolveGizmoPointerTarget(
        event.clientX,
        event.clientY,
        ctx.current.elements,
        {
          raycaster: ctx.current.raycaster,
          camera: ctx.current.camera,
          scene: ctx.current.scene,
          domElement: ctx.current.gl.domElement,
          atlasSize: ctx.current.atlasSize,
        },
        {
          selectedInstanceId: ctx.current.selectedInstanceId,
          requireVisibleButtons: true,
        },
      );

      if (target?.onFrame) {
        ctx.current.bringInstanceToFront(target.element.id);
        ctx.current.setSelectedInstance(target.element.id);
        ctx.current.invalidate();
        return;
      }

      if (target?.buttonHit && target.element.id === ctx.current.selectedInstanceId) {
        return;
      }

      ctx.current.clearSelectedInstance();
      clearGizmoButtonHover();
      ctx.current.invalidate();
    };

    const onControlsStart = () => {
      if (ctx.current.gizmoStep === null) return;
      ctx.current.clearSelectedInstance();
      clearGizmoButtonHover();
      ctx.current.invalidate();
    };

    dom.addEventListener('pointerdown', onPointerDown, { capture: true });
    controls?.addEventListener('start', onControlsStart);

    return () => {
      dom.removeEventListener('pointerdown', onPointerDown, { capture: true });
      controls?.removeEventListener('start', onControlsStart);
    };
  }, [controls, gl]);
};

export { useGizmoSelection };
export type { GizmoSelectionStore };
