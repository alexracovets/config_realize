'use client';

import { useEffect, useRef } from 'react';

import { OrbitControls } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { Raycaster, Vector3 } from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

import {
  applyOrbitZoomAroundPoint,
  clampOrbitCameraOutsideGarment,
  clampOrbitTargetToGarment,
  recenterOrbitTargetByZoom,
  resolveCursorFocusPoint,
  resolveGarmentCenter,
} from '@utils';
import { useConfiguratorProduct } from '@store';

const ORBIT_MIN_DISTANCE = 0.05;
const ORBIT_MAX_DISTANCE = 0.8;
/** Default orbit distance after switching products (zoomed-out framing). */
const PRODUCT_SWITCH_ZOOM_DISTANCE = ORBIT_MAX_DISTANCE;
const ORBIT_MAX_AZIMUTH_ANGLE = Math.PI / 2;
const ORBIT_MAX_POLAR_ANGLE = Math.PI / 1.5;
const ORBIT_DAMPING_FACTOR = 0.05;
const ZOOM_WHEEL_SENSITIVITY = 0.0016;
const ZOOM_DAMPING_FACTOR = 0.1;
const ZOOM_MAX_PENDING_LOG = 0.6;
const ZOOM_SETTLE_EPSILON = 1e-3;

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
  const productPath = useConfiguratorProduct((state) => state.product.path);

  useEffect(() => {
    if (!controls) return;

    pendingZoomRef.current = 0;

    const center = new Vector3();
    const lastCenter = new Vector3(Infinity, Infinity, Infinity);
    let raf = 0;
    let cancelled = false;
    let stableFrames = 0;
    let lastMeshCount = -1;
    let zoomedOut = false;
    let attemptsLeft = 90;
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
  }, [camera, controls, invalidate, scene, productPath]);

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
    controls.addEventListener('change', clampCamera);

    return () => {
      domElement.removeEventListener('wheel', onWheel);
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

  return (
    <OrbitControls
      makeDefault
      enablePan={false}
      enableZoom={false}
      enableDamping
      dampingFactor={ORBIT_DAMPING_FACTOR}
      minDistance={ORBIT_MIN_DISTANCE}
      maxDistance={ORBIT_MAX_DISTANCE}
      maxAzimuthAngle={ORBIT_MAX_AZIMUTH_ANGLE}
      maxPolarAngle={ORBIT_MAX_POLAR_ANGLE}
    />
  );
};

export { ViewControls };
