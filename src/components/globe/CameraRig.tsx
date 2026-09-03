import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const FLY_DISTANCE = 4.2;
const LERP_FACTOR = 0.06;
const ARRIVAL_EPSILON = 0.02;

/** Smoothly flies the camera to face a target direction on the globe. */
export function CameraRig({
  target,
}: {
  target: readonly [number, number, number] | null;
}) {
  const { camera } = useThree();
  const desired = useRef(new THREE.Vector3());
  const flying = useRef(false);

  useEffect(() => {
    if (!target) {
      // Deselecting mid-flight hands control straight back to OrbitControls
      // instead of finishing a fly-to for a selection that no longer exists.
      flying.current = false;
      return;
    }
    desired.current
      .set(target[0], target[1], target[2])
      .normalize()
      .multiplyScalar(FLY_DISTANCE);
    flying.current = true;
  }, [target]);

  useFrame(() => {
    if (!flying.current) return;
    camera.position.lerp(desired.current, LERP_FACTOR);

    if (camera.position.distanceTo(desired.current) < ARRIVAL_EPSILON) {
      flying.current = false;
    }
  });

  return null;
}
