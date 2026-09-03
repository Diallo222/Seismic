import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import type { Quake } from "../../lib/types";
import { latLngToVec3, magToColor } from "../../lib/geo";
import {
  rippleFragmentShader,
  rippleVertexShader,
} from "../../shaders/ripple.glsl";

const MIN_RIPPLE_MAG = 4.5; // only large quakes emit rings — keeps the scene readable
const RING_SIZE = 0.55;
const CYCLE_SECONDS = 4;
const DURATION_SECONDS = 2;

/** Deterministic per-quake phase offset so rings don't pulse in lockstep. */
function hashPhase(id: string, cycle: number) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return ((h % 1000) / 1000) * cycle;
}

function Ripple({ quake, radius }: { quake: Quake; radius: number }) {
  const { position, quaternion } = useMemo(() => {
    const [x, y, z] = latLngToVec3(quake.lat, quake.lng, radius);
    const dir = new THREE.Vector3(x, y, z).normalize();
    const quat = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 0, 1),
      dir
    );
    return { position: new THREE.Vector3(x, y, z), quaternion: quat };
  }, [quake.lat, quake.lng, radius]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uPhase: { value: hashPhase(quake.id, CYCLE_SECONDS) },
          uCycle: { value: CYCLE_SECONDS },
          uDuration: { value: DURATION_SECONDS },
          uSpeed: { value: 0.5 },
          uColor: { value: new THREE.Color(magToColor(quake.mag)) },
        },
        vertexShader: rippleVertexShader,
        fragmentShader: rippleFragmentShader,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      }),
    [quake.id, quake.mag]
  );

  useEffect(() => () => material.dispose(), [material]);

  useFrame(({ clock }) => {
    material.uniforms.uTime.value = clock.elapsedTime;
  });

  return (
    <mesh position={position} quaternion={quaternion} raycast={() => null}>
      <planeGeometry args={[RING_SIZE, RING_SIZE]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}

export function Ripples({
  quakes,
  radius,
}: {
  quakes: Quake[];
  radius: number;
}) {
  const significant = useMemo(
    () => quakes.filter((q) => q.mag >= MIN_RIPPLE_MAG),
    [quakes]
  );

  return (
    <>
      {significant.map((q) => (
        <Ripple key={q.id} quake={q} radius={radius} />
      ))}
    </>
  );
}
