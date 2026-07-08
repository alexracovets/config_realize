'use client';

import type { gizmoButtonHitType, printablePartMeshesType, printDragMoveStateType, printGizmoElementType } from '@configurator/types';
import type { uvPointType } from '@types';
import { setGizmoDragging } from '@configurator/canvas';
import {
  GIZMO_CORNERS,
  logGizmoPlacementForConfig,
  raycastPrintUv,
  resolveGizmoPointerTarget,
  resolvePrintDragMove,
  setGizmoButtonDragActive,
  toPrintLocalPx,
} from '@configurator/gizmo';
import { useGizmoPointerContext } from '@configurator/hooks/useGizmoPointerContext';
import { useConfiguratorProduct, useGarmentLogo, useGarmentName, useGarmentNumber, useGarmentTesto } from '@store';
import { useEffect, useRef } from 'react';
type DragMode = 'move' | 'rotate' | 'scale';

const resolvePrintRotation = (printableParts: printablePartMeshesType[], partId: string, fallback: number) =>
  printableParts.find((part) => part.partId === partId)?.printRotation ?? fallback;

interface UsePrintGizmoDragOptions {
  element: printGizmoElementType;
  elements: printGizmoElementType[];
  printableParts: printablePartMeshesType[];
  atlasSize: { width: number; height: number };
  gizmoStep: number | null;
  selectedInstanceId: string | null;
}

const usePrintGizmoDrag = ({ element, elements, printableParts, atlasSize, gizmoStep, selectedInstanceId }: UsePrintGizmoDragOptions) => {
  const { raycaster, camera, gl, scene, invalidate, controls } = useGizmoPointerContext();

  const ctx = useRef({
    element,
    elements,
    printableParts,
    atlasSize,
    gizmoStep,
    selectedInstanceId,
    raycaster,
    camera,
    gl,
    scene,
    invalidate,
    controls,
  });

  useEffect(() => {
    ctx.current = {
      element,
      elements,
      printableParts,
      atlasSize,
      gizmoStep,
      selectedInstanceId,
      raycaster,
      camera,
      gl,
      scene,
      invalidate,
      controls,
    };
  });

  useEffect(() => {
    const dom = gl.domElement;

    const raycastContext = () => ({
      raycaster: ctx.current.raycaster,
      camera: ctx.current.camera,
      scene: ctx.current.scene,
      domElement: ctx.current.gl.domElement,
      atlasSize: ctx.current.atlasSize,
    });

    const setControls = (enabled: boolean) => {
      setGizmoDragging(!enabled);
    };

    const startDrag = (mode: DragMode, clientX: number, clientY: number, buttonHit: gizmoButtonHitType | null) => {
      const el = ctx.current.element;
      let didChange = false;

      const logPlacement = (
        instance: { label: string; partId: string; uv: uvPointType; rotation: number; fontSize?: number; scale?: number },
        phase: 'drag' | 'release',
      ) => {
        const product = useConfiguratorProduct.getState().product;
        logGizmoPlacementForConfig({
          kind: el.kind,
          label: instance.label,
          partId: instance.partId,
          uv: instance.uv,
          rotation: instance.rotation,
          fontSize: instance.fontSize,
          scale: instance.scale,
          product,
          phase,
        });
      };

      if (el.kind === 'name' || el.kind === 'number' || el.kind === 'testo') {
        const garmentStore = el.kind === 'name' ? useGarmentName : el.kind === 'number' ? useGarmentNumber : useGarmentTesto;
        const instance = garmentStore.getState().instances.find((item) => item.id === el.id);
        if (!instance) return;

        const startRotation = instance.rotation;
        const startFontSize = instance.fontSize;
        const centerUv = { ...instance.uv };
        const grab = raycastPrintUv(clientX, clientY, ctx.current.printableParts, raycastContext());
        let dragMoveState: printDragMoveStateType = {
          offset: grab ? { x: instance.uv.x - grab.uv.x, y: instance.uv.y - grab.uv.y } : { x: 0, y: 0 },
          activePartId: grab?.partId ?? instance.partId,
        };
        const grabPartRotation = grab ? resolvePrintRotation(ctx.current.printableParts, grab.partId, el.partRotation) : el.partRotation;
        const startLocal = grab ? toPrintLocalPx(grab.uv, centerUv, ctx.current.atlasSize, grabPartRotation, 0) : { x: 1, y: 0 };
        const startDistance = Math.hypot(startLocal.x, startLocal.y) || 0.05;
        const startAngle = Math.atan2(startLocal.y, startLocal.x);

        setControls(false);
        if (buttonHit && (mode === 'rotate' || mode === 'scale')) {
          setGizmoButtonDragActive(buttonHit);
        }

        const onMove = (moveEvent: PointerEvent) => {
          const hit = raycastPrintUv(moveEvent.clientX, moveEvent.clientY, ctx.current.printableParts, raycastContext());
          if (!hit) return;

          if (mode === 'move') {
            const move = resolvePrintDragMove(hit, dragMoveState, ctx.current.printableParts);
            if (!move) return;

            dragMoveState = move.state;
            didChange = true;
            garmentStore.getState().updateInstance(el.id, {
              uv: move.uv,
              partId: move.partId,
            });
          } else if (mode === 'rotate') {
            const partRotation = resolvePrintRotation(ctx.current.printableParts, hit.partId, el.partRotation);
            const local = toPrintLocalPx(hit.uv, centerUv, ctx.current.atlasSize, partRotation, 0);
            const angle = Math.atan2(local.y, local.x);
            const deltaDeg = ((angle - startAngle) * 180) / Math.PI;
            didChange = true;
            garmentStore.getState().updateInstance(el.id, { rotation: startRotation + deltaDeg });
          } else {
            const partRotation = resolvePrintRotation(ctx.current.printableParts, hit.partId, el.partRotation);
            const local = toPrintLocalPx(hit.uv, centerUv, ctx.current.atlasSize, partRotation, 0);
            const distance = Math.hypot(local.x, local.y);
            const ratio = distance / Math.max(startDistance, 0.0001);
            const next = Math.min(el.fontSizeMax ?? Infinity, Math.max(el.fontSizeMin ?? 0, Math.round(startFontSize * ratio)));
            didChange = true;
            garmentStore.getState().updateInstance(el.id, { fontSize: next });
          }

          const latest = garmentStore.getState().instances.find((item) => item.id === el.id);
          if (latest && didChange) logPlacement(latest, 'drag');
          ctx.current.invalidate();
        };

        const onUp = () => {
          window.removeEventListener('pointermove', onMove);
          window.removeEventListener('pointerup', onUp);
          window.removeEventListener('pointercancel', onUp);
          setGizmoButtonDragActive(null);
          setControls(true);
          const latest = garmentStore.getState().instances.find((item) => item.id === el.id);
          if (latest && didChange) logPlacement(latest, 'release');
          ctx.current.invalidate();
        };

        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
        window.addEventListener('pointercancel', onUp);
        return;
      }

      const instance = useGarmentLogo.getState().instances.find((item) => item.id === el.id);
      if (!instance) return;

      const startRotation = instance.rotation;
      const startScale = instance.scale;
      const centerUv = { ...instance.uv };
      const grab = raycastPrintUv(clientX, clientY, ctx.current.printableParts, raycastContext());
      let dragMoveState: printDragMoveStateType = {
        offset: grab ? { x: instance.uv.x - grab.uv.x, y: instance.uv.y - grab.uv.y } : { x: 0, y: 0 },
        activePartId: grab?.partId ?? instance.partId,
      };
      const grabPartRotation = grab ? resolvePrintRotation(ctx.current.printableParts, grab.partId, el.partRotation) : el.partRotation;
      const startLocal = grab ? toPrintLocalPx(grab.uv, centerUv, ctx.current.atlasSize, grabPartRotation, 0) : { x: 1, y: 0 };
      const startDistance = Math.hypot(startLocal.x, startLocal.y) || 0.05;
      const startAngle = Math.atan2(startLocal.y, startLocal.x);

      setControls(false);
      if (buttonHit && (mode === 'rotate' || mode === 'scale')) {
        setGizmoButtonDragActive(buttonHit);
      }

      const onMove = (moveEvent: PointerEvent) => {
        const hit = raycastPrintUv(moveEvent.clientX, moveEvent.clientY, ctx.current.printableParts, raycastContext());
        if (!hit) return;

        if (mode === 'move') {
          const move = resolvePrintDragMove(hit, dragMoveState, ctx.current.printableParts);
          if (!move) return;

          dragMoveState = move.state;
          didChange = true;
          useGarmentLogo.getState().updateInstance(el.id, {
            uv: move.uv,
            partId: move.partId,
          });
        } else if (mode === 'rotate') {
          const partRotation = resolvePrintRotation(ctx.current.printableParts, hit.partId, el.partRotation);
          const local = toPrintLocalPx(hit.uv, centerUv, ctx.current.atlasSize, partRotation, 0);
          const angle = Math.atan2(local.y, local.x);
          const deltaDeg = ((angle - startAngle) * 180) / Math.PI;
          didChange = true;
          useGarmentLogo.getState().updateInstance(el.id, { rotation: startRotation + deltaDeg });
        } else {
          const partRotation = resolvePrintRotation(ctx.current.printableParts, hit.partId, el.partRotation);
          const local = toPrintLocalPx(hit.uv, centerUv, ctx.current.atlasSize, partRotation, 0);
          const distance = Math.hypot(local.x, local.y);
          const ratio = distance / Math.max(startDistance, 0.0001);
          const next = Math.min(el.scaleMax ?? Infinity, Math.max(el.scaleMin ?? 0, startScale * ratio));
          didChange = true;
          useGarmentLogo.getState().updateInstance(el.id, { scale: next });
        }

        const latest = useGarmentLogo.getState().instances.find((item) => item.id === el.id);
        if (latest && didChange) logPlacement(latest, 'drag');
        ctx.current.invalidate();
      };

      const onUp = () => {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        window.removeEventListener('pointercancel', onUp);
        setGizmoButtonDragActive(null);
        setControls(true);
        const latest = useGarmentLogo.getState().instances.find((item) => item.id === el.id);
        if (latest && didChange) logPlacement(latest, 'release');
        ctx.current.invalidate();
      };

      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
      window.addEventListener('pointercancel', onUp);
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      if (ctx.current.gizmoStep === null) return;

      const target = resolveGizmoPointerTarget(event.clientX, event.clientY, ctx.current.elements, raycastContext(), {
        selectedInstanceId: ctx.current.selectedInstanceId,
        requireVisibleButtons: true,
      });

      if (!target || target.element.id !== ctx.current.element.id) return;

      const corner = target.buttonHit ? GIZMO_CORNERS.find((item) => item.cornerIndex === target.buttonHit!.cornerIndex) : undefined;
      if (corner && ctx.current.selectedInstanceId !== target.element.id) return;
      if (!corner && !target.onFrame) return;

      if (target.element.kind === 'name') {
        useGarmentName.getState().bringInstanceToFront(target.element.id);
        useGarmentName.getState().setSelectedInstance(target.element.id);
      } else if (target.element.kind === 'number') {
        useGarmentNumber.getState().bringInstanceToFront(target.element.id);
        useGarmentNumber.getState().setSelectedInstance(target.element.id);
      } else if (target.element.kind === 'testo') {
        useGarmentTesto.getState().bringInstanceToFront(target.element.id);
        useGarmentTesto.getState().setSelectedInstance(target.element.id);
      } else {
        useGarmentLogo.getState().bringInstanceToFront(target.element.id);
        useGarmentLogo.getState().setSelectedInstance(target.element.id);
      }
      ctx.current.invalidate();

      event.stopImmediatePropagation();
      event.preventDefault();

      if (corner?.kind === 'duplicate') {
        if (target.element.kind === 'name') {
          useGarmentName.getState().duplicateInstance(target.element.id);
        } else if (target.element.kind === 'number') {
          useGarmentNumber.getState().duplicateInstance(target.element.id);
        } else if (target.element.kind === 'testo') {
          useGarmentTesto.getState().duplicateInstance(target.element.id);
        } else {
          useGarmentLogo.getState().duplicateInstance(target.element.id);
        }
        ctx.current.invalidate();
        return;
      }
      if (corner?.kind === 'delete') {
        if (target.element.kind === 'name') {
          useGarmentName.getState().removeInstance(target.element.id);
        } else if (target.element.kind === 'number') {
          useGarmentNumber.getState().removeInstance(target.element.id);
        } else if (target.element.kind === 'testo') {
          useGarmentTesto.getState().removeInstance(target.element.id);
        } else {
          useGarmentLogo.getState().removeInstance(target.element.id);
        }
        ctx.current.invalidate();
        return;
      }
      startDrag(corner ? corner.kind : 'move', event.clientX, event.clientY, target.buttonHit);
    };

    dom.addEventListener('pointerdown', onPointerDown, { capture: true });
    return () => dom.removeEventListener('pointerdown', onPointerDown, { capture: true });
  }, [gl]);
};

export { usePrintGizmoDrag };
