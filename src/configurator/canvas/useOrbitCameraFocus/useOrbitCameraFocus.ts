'use client';

import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { useFrame, useThree } from '@react-three/fiber';
import { getConfiguratorCameraFocusState, registerConfiguratorCameraDebug, subscribeConfiguratorCameraFocus } from '@configurator/canvas/cameraFocus';
import { orbitControlsRef, syncOrbitControlsEnabled } from '@configurator/canvas/orbitGuard';
import {
  clampOrbitCameraOutsideGarment,
  resolveOrbitFocusPose,
  resolvePrintUvWorldPoint,
  resolveShortestAngleDelta,
} from '@configurator/utils';
import { useConfiguratorProduct } from '@store';
import { useEffect, useRef } from 'react';
import { Spherical, Vector3 } from 'three';

const FOCUS_DURATION_MS = 420;
const FOCUS_RETRY_FRAMES = 90;
const ORBIT_MIN_DISTANCE = 0.05;
const ORBIT_MAX_DISTANCE = 0.9;

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

interface focusAnimationType {
  startTime: number;
  fromTarget: Vector3;
  toTarget: Vector3;
  fromRadius: number;
  toRadius: number;
  fromPhi: number;
  toPhi: number;
  fromTheta: number;
  thetaDelta: number;
}

const getOrbitControls = (): OrbitControlsImpl | null => orbitControlsRef.current;

const useOrbitCameraFocus = () => {
  const camera = useThree((state) => state.camera);
  const scene = useThree((state) => state.scene);
  const invalidate = useThree((state) => state.invalidate);
  const product = useConfiguratorProduct((state) => state.product);
  const animationRef = useRef<focusAnimationType | null>(null);
  const fulfilledRequestIdRef = useRef(0);
  const failedRequestIdRef = useRef(0);
  const pendingRequestIdRef = useRef(0);
  const pendingRetriesRef = useRef(0);
  const focusPointRef = useRef(new Vector3());
  const focusNormalRef = useRef(new Vector3());
  const orbitTargetRef = useRef(new Vector3());
  const orbitCameraRef = useRef(new Vector3());
  const offsetRef = useRef(new Vector3());
  const sphericalRef = useRef(new Spherical());

  const resolveFocusCamera = (partId: string, atlasUv: { x: number; y: number }, viewMode: 'part' | 'surface' = 'surface') => {
    const controls = getOrbitControls();
    const part = product.parts.find((item) => item.id === partId);
    if (!part || !controls) return null;

    const resolved = resolvePrintUvWorldPoint(
      { scene, meshNames: part.meshNames, atlasUv },
      focusPointRef.current,
      focusNormalRef.current,
    );
    if (!resolved) return null;

    const poseResolved = resolveOrbitFocusPose(
      {
        scene,
        focusPoint: focusPointRef.current,
        surfaceNormal: focusNormalRef.current,
        currentCamera: camera.position,
        currentTarget: controls.target,
        minDistance: ORBIT_MIN_DISTANCE,
        maxDistance: ORBIT_MAX_DISTANCE,
        viewMode,
      },
      orbitTargetRef.current,
      orbitCameraRef.current,
    );
    if (!poseResolved) return null;

    return {
      target: orbitTargetRef.current.clone(),
      camera: orbitCameraRef.current.clone(),
    };
  };

  const startAnimation = (nextCamera: Vector3, nextTarget: Vector3) => {
    const controls = getOrbitControls();
    if (!controls) return;

    controls.update();

    const fromRadius = controls.getDistance();
    const fromPhi = controls.getPolarAngle();
    const fromTheta = controls.getAzimuthalAngle();

    offsetRef.current.copy(nextCamera).sub(nextTarget);
    const toSpherical = new Spherical().setFromVector3(offsetRef.current);

    animationRef.current = {
      startTime: performance.now(),
      fromTarget: controls.target.clone(),
      toTarget: nextTarget.clone(),
      fromRadius,
      toRadius: toSpherical.radius,
      fromPhi,
      toPhi: toSpherical.phi,
      fromTheta,
      thetaDelta: resolveShortestAngleDelta(fromTheta, toSpherical.theta),
    };

    controls.enabled = false;
    invalidate();
  };

  const tryFulfillPendingFocus = () => {
    const { requestId, target } = getConfiguratorCameraFocusState();
    if (!target || requestId === fulfilledRequestIdRef.current || requestId === failedRequestIdRef.current) return;

    if (requestId !== pendingRequestIdRef.current) {
      pendingRequestIdRef.current = requestId;
      pendingRetriesRef.current = 0;
    }

    const next = resolveFocusCamera(target.partId, target.uv, target.viewMode ?? 'surface');
    if (!next) {
      pendingRetriesRef.current += 1;
      if (pendingRetriesRef.current >= FOCUS_RETRY_FRAMES) {
        failedRequestIdRef.current = requestId;
        pendingRetriesRef.current = 0;
      } else {
        invalidate();
      }
      return;
    }

    fulfilledRequestIdRef.current = requestId;
    pendingRetriesRef.current = 0;
    startAnimation(next.camera, next.target);
  };

  useFrame(() => {
    tryFulfillPendingFocus();

    const animation = animationRef.current;
    const controls = getOrbitControls();
    if (!animation || !controls) return;

    const elapsed = performance.now() - animation.startTime;
    const progress = easeInOutCubic(Math.min(1, elapsed / FOCUS_DURATION_MS));

    controls.target.lerpVectors(animation.fromTarget, animation.toTarget, progress);

    const { fromRadius, toRadius, fromPhi, toPhi, fromTheta, thetaDelta } = animation;
    sphericalRef.current.radius = fromRadius + (toRadius - fromRadius) * progress;
    sphericalRef.current.phi = fromPhi + (toPhi - fromPhi) * progress;
    sphericalRef.current.theta = fromTheta + thetaDelta * progress;
    offsetRef.current.setFromSpherical(sphericalRef.current);
    camera.position.copy(controls.target).add(offsetRef.current);
    controls.update();

    clampOrbitCameraOutsideGarment({ camera, controls, scene });
    invalidate();

    if (progress < 1) return;

    animationRef.current = null;
    syncOrbitControlsEnabled();
  });

  useEffect(() => subscribeConfiguratorCameraFocus(invalidate), [invalidate]);

  useEffect(() => {
    return registerConfiguratorCameraDebug(() => {
      const controls = getOrbitControls();
      if (!controls) return null;

      controls.update();
      const focusState = getConfiguratorCameraFocusState();

      return {
        azimuth: controls.getAzimuthalAngle(),
        polar: controls.getPolarAngle(),
        radius: controls.getDistance(),
        requestId: focusState.requestId,
        targetPartId: focusState.target?.partId ?? null,
        isAnimating: animationRef.current !== null,
      };
    });
  }, [camera]);
};

export { useOrbitCameraFocus };
