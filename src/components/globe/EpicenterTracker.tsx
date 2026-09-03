import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { Quake } from "../../lib/types";
import { latLngToVec3 } from "../../lib/geo";
import { useEpicenterScreen } from "../../store/useEpicenterScreen";

const GLOBE_RADIUS = 2;
const LABEL_RADIUS = GLOBE_RADIUS * 1.02;

const _world = new THREE.Vector3();
const _ndc = new THREE.Vector3();
const _normal = new THREE.Vector3();
const _camDir = new THREE.Vector3();

/**
 * R3F-only tracker: projects the selected epicenter to screen space and
 * writes coords into a store. Must not render any DOM — that crashes R3F.
 */
export function EpicenterTracker({ quake }: { quake: Quake | null }) {
  const { camera, size } = useThree();
  const setScreen = useEpicenterScreen((s) => s.setScreen);
  const hide = useEpicenterScreen((s) => s.hide);
  const quakeRef = useRef(quake);
  quakeRef.current = quake;

  const position = useMemo(() => {
    if (!quake) return null;
    return latLngToVec3(quake.lat, quake.lng, LABEL_RADIUS);
  }, [quake]);

  useFrame(() => {
    const q = quakeRef.current;
    if (!q || !position) {
      hide();
      return;
    }

    _world.set(position[0], position[1], position[2]);
    _normal.copy(_world).normalize();
    _camDir.copy(camera.position).normalize();

    // Hide when on the far side of the globe.
    if (_normal.dot(_camDir) < 0.12) {
      hide();
      return;
    }

    _ndc.copy(_world).project(camera);
    const x = (_ndc.x * 0.5 + 0.5) * size.width + 18;
    const y = (-_ndc.y * 0.5 + 0.5) * size.height - 28;
    setScreen({ x, y, visible: true });
  });

  return null;
}
