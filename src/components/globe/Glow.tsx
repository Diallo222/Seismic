import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import type { Quake } from "../../lib/types";
import { latLngToVec3, magToColor } from "../../lib/geo";
import { useDashboardStore } from "../../store/useDashboardStore";
import { glowFragmentShader, glowVertexShader } from "../../shaders/glow.glsl";

export function Glow({ quakes, radius }: { quakes: Quake[]; radius: number }) {
  const selectedId = useDashboardStore((s) => s.selectedId);
  const newIds = useDashboardStore((s) => s.newIds);

  const { geometry, material } = useMemo(() => {
    const positions = new Float32Array(quakes.length * 3);
    const mags = new Float32Array(quakes.length);
    const colors = new Float32Array(quakes.length * 3);
    const boosts = new Float32Array(quakes.length);
    const tmpColor = new THREE.Color();

    quakes.forEach((q, i) => {
      const [x, y, z] = latLngToVec3(q.lat, q.lng, radius);
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      mags[i] = q.mag;
      tmpColor.set(magToColor(q.mag));
      colors[i * 3] = tmpColor.r;
      colors[i * 3 + 1] = tmpColor.g;
      colors[i * 3 + 2] = tmpColor.b;
      boosts[i] =
        q.id === selectedId ? 1.6 : newIds.has(q.id) ? 1.15 : q.mag >= 6 ? 0.55 : 0.08;
    });

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("aMag", new THREE.BufferAttribute(mags, 1));
    geo.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
    geo.setAttribute("aBoost", new THREE.BufferAttribute(boosts, 1));

    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uSize: { value: 36 },
        uTime: { value: 0 },
      },
      vertexShader: glowVertexShader,
      fragmentShader: glowFragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    return { geometry: geo, material: mat };
  }, [quakes, radius, selectedId, newIds]);

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  useFrame(({ clock }) => {
    material.uniforms.uTime.value = clock.elapsedTime;
  });

  if (quakes.length === 0) return null;

  return <points geometry={geometry} material={material} raycast={() => null} />;
}
