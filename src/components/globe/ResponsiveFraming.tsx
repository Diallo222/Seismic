import { useLayoutEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

/** Atmosphere-inclusive radius used when framing the globe in view. */
export const FRAME_RADIUS = 2.45;
const FRAME_PADDING = 1.02;
const BASE_FOV = 45;

/** Camera distance that keeps the globe readable for the current aspect. */
export function fitDistance(
  aspect: number,
  fov = BASE_FOV,
  radius = FRAME_RADIUS,
  padding = FRAME_PADDING,
): number {
  const fit = radius * padding;
  const vHalf = THREE.MathUtils.degToRad(fov / 2);
  const distV = fit / Math.tan(vHalf);
  const hHalf = Math.atan(Math.tan(vHalf) * Math.max(aspect, 0.05));
  const distH = fit / Math.tan(hHalf);
  // Prefer a full vertical fill; only ease back a little for narrow views so
  // portrait stays cinematic instead of a tiny globe in empty void.
  if (distH <= distV) return distV;
  return distV + (distH - distV) * 0.4;
}

/**
 * On viewport resize, pull the camera back so the globe stays fully in frame
 * on narrow/portrait aspects (fixed z=6 crops horizontally otherwise).
 */
export function ResponsiveFraming() {
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const controls = useThree((s) => s.controls);
  const lastFit = useRef(0);

  useLayoutEffect(() => {
    if (!(camera instanceof THREE.PerspectiveCamera)) return;

    const aspect = size.width / Math.max(size.height, 1);
    const next = fitDistance(aspect, camera.fov);
    const prev = lastFit.current;

    // Preserve user zoom offset relative to the previous fit distance.
    const current = camera.position.length();
    const zoomFactor =
      prev > 0 ? THREE.MathUtils.clamp(current / prev, 0.55, 2.2) : 1;

    const dir = camera.position.clone();
    if (dir.lengthSq() < 1e-8) dir.set(0, 0, 1);
    else dir.normalize();

    camera.position.copy(dir.multiplyScalar(next * zoomFactor));
    camera.updateProjectionMatrix();
    lastFit.current = next;

    if (controls && typeof controls === "object" && "minDistance" in controls) {
      const c = controls as unknown as {
        minDistance: number;
        maxDistance: number;
      };
      c.minDistance = next * 0.5;
      c.maxDistance = next * 2.4;
    }
  }, [camera, size.width, size.height, controls]);

  return null;
}
