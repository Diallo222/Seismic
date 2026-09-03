import { useLayoutEffect, useMemo, useRef, useState } from "react";
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

const SELECTED_SCALE_BOOST = 2.05;
const NEW_QUAKE_SCALE_BOOST = 1.45;
const HOVER_SCALE_BOOST = 1.35;

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

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

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
      mesh.setColorAt(i, color);
    });

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [quakes, radius, selectedId, newIds, hoveredId, dummy, color]);

  // Soft breathe — only the selected instance.
  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    const idx = selectedIndexRef.current;
    if (!mesh || idx < 0) return;

    const q = quakes[idx];
    if (!q || q.id !== selectedId) return;

    const [x, y, z] = latLngToVec3(q.lat, q.lng, radius);
    const pulse = 1 + Math.sin(clock.elapsedTime * 2.6) * 0.08;
    dummy.position.set(x, y, z);
    dummy.lookAt(0, 0, 0);
    dummy.scale.setScalar(magToSize(q.mag) * SELECTED_SCALE_BOOST * pulse);
    dummy.updateMatrix();
    mesh.setMatrixAt(idx, dummy.matrix);
    mesh.instanceMatrix.needsUpdate = true;
  });

  if (count === 0) return null;

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    const id = e.instanceId;
    if (id == null) return;
    const q = quakes[id];
    if (!q) return;
    select(q.id === selectedId ? null : q.id);
  };

  const handleMove = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    const id = e.instanceId;
    if (id == null) return;
    const q = quakes[id];
    if (!q) return;
    if (hoveredId !== q.id) setHoveredId(q.id);
    document.body.style.cursor = "pointer";
  };

  return (
    <instancedMesh
      key={count}
      ref={meshRef}
      args={[undefined, undefined, count]}
      onClick={handleClick}
      onPointerMove={handleMove}
      onPointerOut={() => {
        setHoveredId(null);
        document.body.style.cursor = "auto";
      }}
    >
      <sphereGeometry args={[1, 16, 16]} />
      <meshBasicMaterial
        toneMapped={false}
        transparent
        opacity={0.95}
        depthWrite={false}
      />
    </instancedMesh>
  );
}
