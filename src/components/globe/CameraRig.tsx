import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { fitDistance } from "./ResponsiveFraming";

const LERP_FACTOR = 0.06;
const ARRIVAL_EPSILON = 0.02;
/** Fly slightly closer than the fit distance for a dramatic approach. */
const FLY_FACTOR = 0.72;

/** Smoothly flies the camera to face a target direction on the globe. */
export function CameraRig({
  target,
}: {
  target: readonly [number, number, number] | null;
}) {
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const desired = useRef(new THREE.Vector3());
  const flying = useRef(false);

  useEffect(() => {
    if (!target) {
      // Deselecting mid-flight hands control straight back to OrbitControls
      // instead of finishing a fly-to for a selection that no longer exists.
      flying.current = false;
      return;
    }
    const aspect = size.width / Math.max(size.height, 1);
    const fov =
      camera instanceof THREE.PerspectiveCamera ? camera.fov : 45;
    const distance = fitDistance(aspect, fov) * FLY_FACTOR;

    desired.current
      .set(target[0], target[1], target[2])
      .normalize()
      .multiplyScalar(distance);
    flying.current = true;
  }, [target, camera, size.width, size.height]);

  useFrame(() => {
    if (!flying.current) return;
    camera.position.lerp(desired.current, LERP_FACTOR);

    if (camera.position.distanceTo(desired.current) < ARRIVAL_EPSILON) {
      flying.current = false;
    }
  });

  return null;
}
