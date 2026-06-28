'use client';

import type { printGizmoElementType } from '@configurator/types';
import {
  clearGizmoButtonHover,
  getGizmoButtonReveal,
  getGizmoHoverCursor,
  isGizmoButtonDragActive,
  resolveGizmoPointerTarget,
  setGizmoButtonHover,
  toLocalPx,
} from '@configurator/gizmo';
import { useGizmoPointerContext } from '@configurator/hooks/useGizmoPointerContext';
import { useEffect, useRef } from 'react';
interface UseGizmoButtonHoverOptions {
  elements: printGizmoElementType[];
  atlasSize: { width: number; height: number };
  gizmoStep: number | null;
  selectedInstanceId: string | null;
}

const useGizmoButtonHover = ({ elements, atlasSize, gizmoStep, selectedInstanceId }: UseGizmoButtonHoverOptions) => {
  const { raycaster, camera, gl, scene, invalidate } = useGizmoPointerContext();

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
