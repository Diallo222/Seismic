import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import type { Quake } from "../../lib/types";
import {
  latLngToVec3,
  magToColor,
  magToSize,
  NEW_MARKER_COLOR,
  SELECTED_MARKER_COLOR,
} from "../../lib/geo";
import { useDashboardStore } from "../../store/useDashboardStore";
import {
  markerFragmentShader,
  markerVertexShader,
} from "../../shaders/marker.glsl";
import { playMarkerClick } from "../../lib/clickSound";

const SELECTED_SCALE_BOOST = 2.2;
const NEW_QUAKE_SCALE_BOOST = 1.55;
const HOVER_SCALE_BOOST = 1.4;

export function Markers({
  quakes,
  radius,
}: {
  quakes: Quake[];
  radius: number;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const count = quakes.length;
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const selectedId = useDashboardStore((s) => s.selectedId);
  const select = useDashboardStore((s) => s.select);
  const newIds = useDashboardStore((s) => s.newIds);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const color = useMemo(() => new THREE.Color(), []);
  const selectedIndexRef = useRef(-1);
  const colorAttrRef = useRef<THREE.InstancedBufferAttribute | null>(null);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: markerVertexShader,
        fragmentShader: markerFragmentShader,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
      }),
    [],
  );

  useEffect(() => () => material.dispose(), [material]);

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    // Per-instance color for the custom shader (instanceColorAttr).
    // Always re-bind to the current geometry — remounts can leave a stale attr.
    let colorAttr = colorAttrRef.current;
    if (!colorAttr || colorAttr.count !== count) {
      colorAttr = new THREE.InstancedBufferAttribute(
        new Float32Array(count * 3),
        3,
      );
      colorAttrRef.current = colorAttr;
    }
    mesh.geometry.setAttribute("instanceColorAttr", colorAttr);

    // Instances sit on the globe (~r=2); default unit-sphere bounds at origin
    // can frustum-cull the whole batch under extreme aspects.
    mesh.frustumCulled = false;
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

    selectedIndexRef.current = -1;

    quakes.forEach((q, i) => {
      const [x, y, z] = latLngToVec3(q.lat, q.lng, radius);
      dummy.position.set(x, y, z);
      dummy.lookAt(0, 0, 0);

      const isSelected = q.id === selectedId;
      const isNew = newIds.has(q.id);
      const isHovered = q.id === hoveredId;
      if (isSelected) selectedIndexRef.current = i;

      let boost = 1;
      if (isSelected) boost = SELECTED_SCALE_BOOST;
      else if (isNew) boost = NEW_QUAKE_SCALE_BOOST;
      else if (isHovered) boost = HOVER_SCALE_BOOST;

      dummy.scale.setScalar(magToSize(q.mag) * boost);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);

      if (isSelected) color.set(SELECTED_MARKER_COLOR);
      else if (isNew) color.set(NEW_MARKER_COLOR);
      else color.set(magToColor(q.mag));
      colorAttr.setXYZ(i, color.r, color.g, color.b);
    });

    mesh.instanceMatrix.needsUpdate = true;
    colorAttr.needsUpdate = true;
  }, [quakes, radius, selectedId, newIds, hoveredId, dummy, color, count]);

  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    const idx = selectedIndexRef.current;
    if (!mesh || idx < 0) return;

    const q = quakes[idx];
    if (!q || q.id !== selectedId) return;

    const [x, y, z] = latLngToVec3(q.lat, q.lng, radius);
    const pulse = 1 + Math.sin(clock.elapsedTime * 2.8) * 0.1;
    dummy.position.set(x, y, z);
    dummy.lookAt(0, 0, 0);
    dummy.scale.setScalar(magToSize(q.mag) * SELECTED_SCALE_BOOST * pulse);
    dummy.updateMatrix();
    mesh.setMatrixAt(idx, dummy.matrix);
    mesh.instanceMatrix.needsUpdate = true;
  });

  if (count === 0) return null;

  return (
    <instancedMesh
      key={count}
      ref={meshRef}
      args={[undefined, undefined, count]}
      onClick={(e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        const id = e.instanceId;
        if (id == null) return;
        const q = quakes[id];
        if (!q) return;
        playMarkerClick();
        select(q.id === selectedId ? null : q.id);
      }}
      onPointerMove={(e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        const id = e.instanceId;
        if (id == null) return;
        const q = quakes[id];
        if (!q) return;
        if (hoveredId !== q.id) setHoveredId(q.id);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHoveredId(null);
        document.body.style.cursor = "auto";
      }}
    >
      <sphereGeometry args={[1, 20, 20]} />
      <primitive object={material} attach="material" />
    </instancedMesh>
  );
}
