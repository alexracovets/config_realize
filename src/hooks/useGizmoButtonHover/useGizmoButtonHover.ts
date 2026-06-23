'use client';

import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';

import type { printGizmoElementType } from '@types';
import {
  clearGizmoButtonHover,
  getGizmoButtonReveal,
  getGizmoHoverCursor,
  isGizmoButtonDragActive,
  resolveGizmoPointerTarget,
  setGizmoButtonHover,
  toLocalPx,
} from '@gizmo';

interface UseGizmoButtonHoverOptions {
  elements: printGizmoElementType[];
  atlasSize: { width: number; height: number };
  gizmoStep: number | null;
  selectedInstanceId: string | null;
}

const useGizmoButtonHover = ({ elements, atlasSize, gizmoStep, selectedInstanceId }: UseGizmoButtonHoverOptions) => {
  const raycaster = useThree((state) => state.raycaster);
  const camera = useThree((state) => state.camera);
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);
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
      invalidate,
    };
  });

  useEffect(() => {
    const dom = gl.domElement;

    const onPointerMove = (event: PointerEvent) => {
      if (ctx.current.gizmoStep === null) return;
      if (isGizmoButtonDragActive()) return;

      const c = ctx.current;
      const target = resolveGizmoPointerTarget(
        event.clientX,
        event.clientY,
        c.elements,
        {
          raycaster: c.raycaster,
          camera: c.camera,
          scene: c.scene,
          domElement: c.gl.domElement,
          atlasSize: c.atlasSize,
        },
        {
          selectedInstanceId: c.selectedInstanceId,
          requireVisibleButtons: true,
        },
      );

      if (!target) {
        dom.style.cursor = '';
        clearGizmoButtonHover();
        return;
      }

      const world = toLocalPx(target.uv, target.element, c.atlasSize);
      const buttonsVisible = c.selectedInstanceId === target.element.id && getGizmoButtonReveal(target.element.slotIndex) > 0.5;

      dom.style.cursor = getGizmoHoverCursor(world, target.element, buttonsVisible) ?? '';
      setGizmoButtonHover(target.buttonHit);
    };

    const onPointerLeave = () => {
      if (isGizmoButtonDragActive()) return;
      dom.style.cursor = '';
      clearGizmoButtonHover();
    };

    dom.addEventListener('pointermove', onPointerMove);
    dom.addEventListener('pointerleave', onPointerLeave);

    return () => {
      dom.removeEventListener('pointermove', onPointerMove);
      dom.removeEventListener('pointerleave', onPointerLeave);
      dom.style.cursor = '';
      clearGizmoButtonHover();
    };
  }, [gl]);
};

export { useGizmoButtonHover };
