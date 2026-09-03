import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { ThreeEvent } from "@react-three/fiber";
import type { Quake } from "../../lib/types";
import { latLngToVec3, magToColor, magToSize } from "../../lib/geo";
import { useDashboardStore } from "../../store/useDashboardStore";

const SELECTED_SCALE_BOOST = 1.8;
const NEW_QUAKE_SCALE_BOOST = 1.4;

export function Markers({
  quakes,
  radius,
}: {
  quakes: Quake[];
  radius: number;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const count = quakes.length;

  const selectedId = useDashboardStore((s) => s.selectedId);
  const select = useDashboardStore((s) => s.select);
  const newIds = useDashboardStore((s) => s.newIds);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const color = useMemo(() => new THREE.Color(), []);

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    quakes.forEach((q, i) => {
      const [x, y, z] = latLngToVec3(q.lat, q.lng, radius);
      dummy.position.set(x, y, z);
      dummy.lookAt(0, 0, 0);
      const boost = q.id === selectedId
        ? SELECTED_SCALE_BOOST
        : newIds.has(q.id)
          ? NEW_QUAKE_SCALE_BOOST
          : 1;
      dummy.scale.setScalar(magToSize(q.mag) * boost);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      color.set(q.id === selectedId ? "#ffffff" : magToColor(q.mag));
      mesh.setColorAt(i, color);
    });

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [quakes, radius, selectedId, newIds, dummy, color]);

  if (count === 0) return null;

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    const id = e.instanceId;
    if (id == null) return;
    const q = quakes[id];
    if (!q) return;
    select(q.id === selectedId ? null : q.id);
  };

  return (
    <instancedMesh
      key={count}
      ref={meshRef}
      args={[undefined, undefined, count]}
      onClick={handleClick}
      onPointerOver={() => {
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "auto";
      }}
    >
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial toneMapped={false} />
    </instancedMesh>
  );
}
