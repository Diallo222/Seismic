import { useEffect, useMemo } from "react";
import * as THREE from "three";
import type { Quake } from "../../lib/types";
import { latLngToVec3, magToColor } from "../../lib/geo";
import { glowFragmentShader, glowVertexShader } from "../../shaders/glow.glsl";

export function Glow({ quakes, radius }: { quakes: Quake[]; radius: number }) {
  const { geometry, material } = useMemo(() => {
    const positions = new Float32Array(quakes.length * 3);
    const mags = new Float32Array(quakes.length);
    const colors = new Float32Array(quakes.length * 3);
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
    });

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("aMag", new THREE.BufferAttribute(mags, 1));
    geo.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.ShaderMaterial({
      uniforms: { uSize: { value: 14 } },
      vertexShader: glowVertexShader,
      fragmentShader: glowFragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    return { geometry: geo, material: mat };
  }, [quakes, radius]);

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  if (quakes.length === 0) return null;

  // Purely additive dressing — Markers already owns click/selection raycasting.
  return <points geometry={geometry} material={material} raycast={() => null} />;
}
