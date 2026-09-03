import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { RefObject } from "react";

const FLY_DISTANCE = 4.2;
const LERP_FACTOR = 0.06;
const ARRIVAL_EPSILON = 0.02;

type OrbitControlsLike = { update: () => void };

/** Smoothly flies the camera to face a target direction on the globe. */
export function CameraRig({
  target,
  controlsRef,
}: {
  target: readonly [number, number, number] | null;
  controlsRef: RefObject<OrbitControlsLike | null>;
}) {
  const { camera } = useThree();
  const desired = useRef(new THREE.Vector3());
  const flying = useRef(false);

  useEffect(() => {
    if (!target) return;
    desired.current
      .set(target[0], target[1], target[2])
      .normalize()
      .multiplyScalar(FLY_DISTANCE);
    flying.current = true;
  }, [target]);

  useFrame(() => {
    if (!flying.current) return;
    camera.position.lerp(desired.current, LERP_FACTOR);
    controlsRef.current?.update();
    if (camera.position.distanceTo(desired.current) < ARRIVAL_EPSILON) {
      flying.current = false;
    }
  });

  return null;
}
