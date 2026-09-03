import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import type { Quake } from "../../lib/types";
import { latLngToVec3, magToColor, NEW_MARKER_COLOR } from "../../lib/geo";
import { useDashboardStore } from "../../store/useDashboardStore";
import {
  rippleFragmentShader,
  rippleVertexShader,
} from "../../shaders/ripple.glsl";

const MIN_RIPPLE_MAG = 4.5;
const RING_SIZE = 0.72;
const CYCLE_SECONDS = 4.5;
const DURATION_SECONDS = 2.2;

/** Deterministic per-quake phase offset so looping rings don't pulse in lockstep. */
function hashPhase(id: string, cycle: number) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return ((h % 1000) / 1000) * cycle;
}

function Ripple({
  quake,
  radius,
  isNew,
}: {
  quake: Quake;
  radius: number;
  isNew: boolean;
}) {
  const wasNewRef = useRef(isNew);
  const clock = useThree((s) => s.clock);

  const { position, quaternion, ringScale } = useMemo(() => {
    const [x, y, z] = latLngToVec3(quake.lat, quake.lng, radius);
    const dir = new THREE.Vector3(x, y, z).normalize();
    const quat = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 0, 1),
      dir,
    );
    const scale = RING_SIZE * (0.85 + Math.min(quake.mag, 8) * 0.06);
    return {
      position: new THREE.Vector3(x, y, z),
      quaternion: quat,
      ringScale: scale,
    };
  }, [quake.lat, quake.lng, quake.mag, radius]);

  const material = useMemo(() => {
    const phase = wasNewRef.current
      ? (CYCLE_SECONDS - (clock.elapsedTime % CYCLE_SECONDS)) % CYCLE_SECONDS
      : hashPhase(quake.id, CYCLE_SECONDS);

    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uPhase: { value: phase },
        uCycle: { value: CYCLE_SECONDS },
        uDuration: {
          value: wasNewRef.current ? DURATION_SECONDS * 1.15 : DURATION_SECONDS,
        },
        uSpeed: { value: wasNewRef.current ? 0.58 : 0.42 },
        uMag: { value: quake.mag },
        uColor: {
          value: new THREE.Color(
            wasNewRef.current ? NEW_MARKER_COLOR : magToColor(quake.mag),
          ),
        },
      },
      vertexShader: rippleVertexShader,
      fragmentShader: rippleFragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
  }, [quake.id, quake.mag, clock]);

  useEffect(() => () => material.dispose(), [material]);

  useFrame(({ clock: frameClock }) => {
    material.uniforms.uTime.value = frameClock.elapsedTime;
  });

  return (
    <mesh
      position={position}
      quaternion={quaternion}
      scale={ringScale}
      raycast={() => null}
    >
      <planeGeometry args={[1, 1]} />
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
  const newIds = useDashboardStore((s) => s.newIds);

  const active = useMemo(
    () => quakes.filter((q) => q.mag >= MIN_RIPPLE_MAG || newIds.has(q.id)),
    [quakes, newIds],
  );

  return (
    <>
      {active.map((q) => (
        <Ripple key={q.id} quake={q} radius={radius} isNew={newIds.has(q.id)} />
      ))}
    </>
  );
}
