import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import type { Quake } from "../../lib/types";
import { latLngToVec3, NEW_MARKER_COLOR } from "../../lib/geo";
import {
  selectionHaloFragmentShader,
  selectionHaloVertexShader,
} from "../../shaders/selectionHalo.glsl";

const HALO_SIZE = 0.38;

/** Dual breathing rings locked to the selected epicenter. */
export function SelectionHalo({
  quake,
  radius,
}: {
  quake: Quake;
  radius: number;
}) {
  const { position, quaternion } = useMemo(() => {
    const [x, y, z] = latLngToVec3(quake.lat, quake.lng, radius * 1.002);
    const dir = new THREE.Vector3(x, y, z).normalize();
    const quat = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 0, 1),
      dir,
    );
    return { position: new THREE.Vector3(x, y, z), quaternion: quat };
  }, [quake.lat, quake.lng, radius]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uColor: { value: new THREE.Color(NEW_MARKER_COLOR) },
        },
        vertexShader: selectionHaloVertexShader,
        fragmentShader: selectionHaloFragmentShader,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      }),
    [],
  );

  useEffect(() => () => material.dispose(), [material]);

  useFrame(({ clock }) => {
    material.uniforms.uTime.value = clock.elapsedTime;
  });

  const scale = HALO_SIZE * (0.9 + Math.min(quake.mag, 8) * 0.05);

  return (
    <mesh
      position={position}
      quaternion={quaternion}
      scale={scale}
      raycast={() => null}
    >
      <planeGeometry args={[1, 1]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}
