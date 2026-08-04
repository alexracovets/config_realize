'use client';

import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { registerCameraBridgeHandlers } from '@configurator/canvas/cameraBridge';
import { orbitControlsRef, syncOrbitControlsEnabled } from '@configurator/canvas/orbitGuard';
import { useOrbitCameraFocus } from '@configurator/canvas/useOrbitCameraFocus';
import {
  applyOrbitZoomAroundPoint,
  clampOrbitCameraOutsideGarment,
  clampOrbitTargetToGarment,
  recenterOrbitTargetByZoom,
  resolveCursorFocusPoint,
  resolveGarmentCenter,
} from '@configurator/utils';
import { OrbitControls } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useConfiguratorProduct, useConfiguratorSceneLoad } from '@store';
import { useCallback, useEffect, useRef } from 'react';
import { Raycaster, TOUCH, Vector3 } from 'three';
const ORBIT_MIN_DISTANCE = 0.05;
const ORBIT_MAX_DISTANCE = 0.9;

const PRODUCT_SWITCH_ZOOM_DISTANCE = ORBIT_MAX_DISTANCE;
const ORBIT_MAX_POLAR_ANGLE = Math.PI / 1.5;
const ORBIT_DAMPING_FACTOR = 0.05;
const ZOOM_WHEEL_SENSITIVITY = 0.0016;
const ZOOM_DAMPING_FACTOR = 0.1;
const ZOOM_MAX_PENDING_LOG = 0.6;
const ZOOM_SETTLE_EPSILON = 1e-3;
const BUTTON_ZOOM_STEP_LOG = 0.22;
const BUTTON_ROTATE_STEP = Math.PI / 4;
const BUTTON_ROTATE_HOLD_SPEED = Math.PI / 1.2;
const BUTTON_ROTATE_SMOOTHING = 7;
const BUTTON_ROTATE_SETTLE_EPSILON = 1e-4;
const BUTTON_ROTATE_MAX_DELTA = 1 / 30;
const Y_AXIS = new Vector3(0, 1, 0);

const ViewControls = () => {
  const isClampingRef = useRef(false);
  const pendingZoomRef = useRef(0);
  const zoomFocusRef = useRef(new Vector3());
  const raycasterRef = useRef(new Raycaster());
  const camera = useThree((state) => state.camera);
  const scene = useThree((state) => state.scene);
  const gl = useThree((state) => state.gl);
  const invalidate = useThree((state) => state.invalidate);
  const controls = useThree((state) => state.controls as OrbitControlsImpl | undefined);
  useOrbitCameraFocus();
  const modelId = useConfiguratorProduct((state) => state.modelId);
  const productPath = useConfiguratorProduct((state) => state.product.path);
  const isSceneTransitionLoading = useConfiguratorSceneLoad((state) => state.isSceneTransitionLoading);
  const wasTransitioningRef = useRef(false);

  const runGarmentCameraFraming = useCallback(() => {
    if (!controls) return () => undefined;

    pendingZoomRef.current = 0;

    const center = new Vector3();
    const lastCenter = new Vector3(Infinity, Infinity, Infinity);
    let raf = 0;
    let cancelled = false;
    let stableFrames = 0;
    let lastMeshCount = -1;
    let zoomedOut = false;
    let attemptsLeft = 120;
    let frameTick = 0;

    const zoomOutOnProductSwitch = () => {
      if (zoomedOut) return;
      zoomedOut = true;

      const distance = camera.position.distanceTo(controls.target);
      if (distance >= PRODUCT_SWITCH_ZOOM_DISTANCE - 1e-4) return;

      zoomFocusRef.current.copy(controls.target);
      pendingZoomRef.current = Math.log(PRODUCT_SWITCH_ZOOM_DISTANCE / distance);
      invalidate();
    };

    const centerOnGarment = () => {
      if (cancelled) return;

      const stillTransitioning = useConfiguratorSceneLoad.getState().isSceneTransitionLoading;

      frameTick += 1;
      if (frameTick % 2 === 0) {
        scene.updateMatrixWorld(true);
      }

      let meshCount = 0;
      scene.traverse((o) => {
        if ((o as { isMesh?: boolean }).isMesh && o.visible && o.userData?.configuratorGarment === true) meshCount++;
      });

      if (!resolveGarmentCenter(scene, center)) {
        if (attemptsLeft-- > 0) raf = requestAnimationFrame(centerOnGarment);
        return;
      }

      if (center.distanceToSquared(controls.target) > 1e-10) {
        camera.position.add(center).sub(controls.target);
        controls.target.copy(center);
        controls.update();
        invalidate();
      }

      if (stillTransitioning) {
        stableFrames = 0;
        if (attemptsLeft-- > 0) raf = requestAnimationFrame(centerOnGarment);
        return;
      }

      const centerStable = center.distanceToSquared(lastCenter) < 1e-12;
      const meshCountStable = meshCount === lastMeshCount;
      stableFrames = centerStable && meshCountStable ? stableFrames + 1 : 0;
      lastCenter.copy(center);
      lastMeshCount = meshCount;

      if (stableFrames >= 3) {
        zoomOutOnProductSwitch();
        return;
      }

      if (attemptsLeft-- > 0) {
        raf = requestAnimationFrame(centerOnGarment);
      } else {
        zoomOutOnProductSwitch();
      }
    };

    raf = requestAnimationFrame(centerOnGarment);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [camera, controls, invalidate, scene]);

  useEffect(() => runGarmentCameraFraming(), [modelId, productPath, runGarmentCameraFraming]);

  useEffect(() => {
    const wasTransitioning = wasTransitioningRef.current;
    wasTransitioningRef.current = isSceneTransitionLoading;

    if (!wasTransitioning || isSceneTransitionLoading) return;

    let cleanup: (() => void) | undefined;
    let outerRaf = 0;
    let innerRaf = 0;

    outerRaf = requestAnimationFrame(() => {
      innerRaf = requestAnimationFrame(() => {
        cleanup = runGarmentCameraFraming();
      });
    });

    return () => {
      cancelAnimationFrame(outerRaf);
      cancelAnimationFrame(innerRaf);
      cleanup?.();
    };
  }, [isSceneTransitionLoading, runGarmentCameraFraming]);

  useEffect(() => {
    if (!controls) return;

    const domElement = gl.domElement;

    const onWheel = (event: WheelEvent) => {
      if (!controls.enabled) return;
      event.preventDefault();

      const resolved = resolveCursorFocusPoint(
        { camera, controls, scene, raycaster: raycasterRef.current, domElement, clientX: event.clientX, clientY: event.clientY },
        zoomFocusRef.current,
      );
      if (!resolved) return;

      const next = pendingZoomRef.current + event.deltaY * ZOOM_WHEEL_SENSITIVITY;
      pendingZoomRef.current = Math.min(ZOOM_MAX_PENDING_LOG, Math.max(-ZOOM_MAX_PENDING_LOG, next));
      invalidate();
    };

    const activePointers = new Map<number, { x: number; y: number }>();
    let pinchDistance = 0;

    const pinchSpan = () => {
      const [a, b] = Array.from(activePointers.values());
      return Math.hypot(a.x - b.x, a.y - b.y);
    };

    const pinchCenter = () => {
      const [a, b] = Array.from(activePointers.values());
      return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType !== 'touch') return;
      activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      if (activePointers.size === 2) pinchDistance = pinchSpan();
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== 'touch' || !activePointers.has(event.pointerId)) return;
      activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

      if (activePointers.size !== 2 || !controls.enabled) return;

      const span = pinchSpan();
      if (!pinchDistance || !span) {
        pinchDistance = span;
        return;
      }

      event.preventDefault();

      const center = pinchCenter();
      const resolved = resolveCursorFocusPoint(
        { camera, controls, scene, raycaster: raycasterRef.current, domElement, clientX: center.x, clientY: center.y },
        zoomFocusRef.current,
      );
      if (!resolved) {
        pinchDistance = span;
        return;
      }

      const next = pendingZoomRef.current - Math.log(span / pinchDistance);
      pendingZoomRef.current = Math.min(ZOOM_MAX_PENDING_LOG, Math.max(-ZOOM_MAX_PENDING_LOG, next));
      pinchDistance = span;
      invalidate();
    };

    const onPointerUp = (event: PointerEvent) => {
      if (event.pointerType !== 'touch') return;
      activePointers.delete(event.pointerId);
      pinchDistance = 0;
    };

    const clampCamera = () => {
      if (isClampingRef.current) return;
      isClampingRef.current = true;
      try {
        let adjusted = recenterOrbitTargetByZoom({ camera, controls, scene, minDistance: ORBIT_MIN_DISTANCE, maxDistance: ORBIT_MAX_DISTANCE });
        adjusted = clampOrbitTargetToGarment({ controls, scene }) || adjusted;
        adjusted = clampOrbitCameraOutsideGarment({ camera, controls, scene }) || adjusted;
        if (adjusted) invalidate();
      } finally {
        isClampingRef.current = false;
      }
    };

    domElement.addEventListener('wheel', onWheel, { passive: false });
    domElement.addEventListener('pointerdown', onPointerDown);
    domElement.addEventListener('pointermove', onPointerMove, { passive: false });
    domElement.addEventListener('pointerup', onPointerUp);
    domElement.addEventListener('pointercancel', onPointerUp);
    controls.addEventListener('change', clampCamera);

    return () => {
      domElement.removeEventListener('wheel', onWheel);
      domElement.removeEventListener('pointerdown', onPointerDown);
      domElement.removeEventListener('pointermove', onPointerMove);
      domElement.removeEventListener('pointerup', onPointerUp);
      domElement.removeEventListener('pointercancel', onPointerUp);
      controls.removeEventListener('change', clampCamera);
    };
  }, [camera, controls, gl.domElement, invalidate, scene]);

  useFrame(() => {
    const pending = pendingZoomRef.current;
    if (Math.abs(pending) < ZOOM_SETTLE_EPSILON) {
      if (pending !== 0) pendingZoomRef.current = 0;
      return;
    }
    if (!controls) return;

    const stepLog = pending * ZOOM_DAMPING_FACTOR;
    pendingZoomRef.current = pending - stepLog;

    applyOrbitZoomAroundPoint(camera, controls, zoomFocusRef.current, Math.exp(stepLog), ORBIT_MIN_DISTANCE, ORBIT_MAX_DISTANCE);
    controls.update();
    invalidate();
  });

  const holdRotateDirectionRef = useRef(0);
  const pendingRotateRef = useRef(0);
  const rotateOffsetRef = useRef(new Vector3());

  const rotateByAngle = useCallback(
    (angle: number) => {
      if (!controls) return;

      const offset = rotateOffsetRef.current;
      offset.copy(camera.position).sub(controls.target);
      offset.applyAxisAngle(Y_AXIS, angle);
      camera.position.copy(controls.target).add(offset);
      controls.update();
      clampOrbitCameraOutsideGarment({ camera, controls, scene });
      invalidate();
    },
    [camera, controls, scene, invalidate],
  );

  useFrame((_, delta) => {
    const dt = Math.min(delta, BUTTON_ROTATE_MAX_DELTA);

    const holdDirection = holdRotateDirectionRef.current;
    if (holdDirection !== 0) {
      rotateByAngle(holdDirection * BUTTON_ROTATE_HOLD_SPEED * dt);
    }

    const pending = pendingRotateRef.current;
    if (Math.abs(pending) < BUTTON_ROTATE_SETTLE_EPSILON) {
      if (pending !== 0) pendingRotateRef.current = 0;
      return;
    }

    const step = pending * (1 - Math.exp(-BUTTON_ROTATE_SMOOTHING * dt));
    pendingRotateRef.current = pending - step;
    rotateByAngle(step);
  });

  useEffect(() => {
    return registerCameraBridgeHandlers({
      rotate: (direction) => {
        if (holdRotateDirectionRef.current !== 0) return;
        pendingRotateRef.current += direction * BUTTON_ROTATE_STEP;
        invalidate();
      },
      zoom: (direction) => {
        pendingZoomRef.current = Math.min(ZOOM_MAX_PENDING_LOG, Math.max(-ZOOM_MAX_PENDING_LOG, pendingZoomRef.current - direction * BUTTON_ZOOM_STEP_LOG));
        if (controls) zoomFocusRef.current.copy(controls.target);
        invalidate();
      },
      startRotate: (direction) => {
        pendingRotateRef.current = 0;
        holdRotateDirectionRef.current = direction;
        invalidate();
      },
      stopRotate: () => {
        holdRotateDirectionRef.current = 0;
      },
    });
  }, [controls, invalidate, rotateByAngle]);

  return (
    <OrbitControls
      ref={(instance) => {
        orbitControlsRef.current = instance;
        syncOrbitControlsEnabled();
      }}
      makeDefault
      enablePan={false}
      enableZoom={false}
      touches={{ ONE: TOUCH.ROTATE }}
      enableDamping
      dampingFactor={ORBIT_DAMPING_FACTOR}
      minDistance={ORBIT_MIN_DISTANCE}
      maxDistance={ORBIT_MAX_DISTANCE}
      maxPolarAngle={ORBIT_MAX_POLAR_ANGLE}
    />
  );
};

export { ViewControls };
