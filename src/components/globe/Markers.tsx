import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { Quake } from "../../lib/types";
import { latLngToVec3, magToColor, magToSize } from "../../lib/geo";

export function Markers({
  quakes,
  radius,
}: {
  quakes: Quake[];
  radius: number;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const count = quakes.length;

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const color = useMemo(() => new THREE.Color(), []);

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    quakes.forEach((q, i) => {
      const [x, y, z] = latLngToVec3(q.lat, q.lng, radius);
      dummy.position.set(x, y, z);
      dummy.lookAt(0, 0, 0);
      dummy.scale.setScalar(magToSize(q.mag));
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      color.set(magToColor(q.mag));
      mesh.setColorAt(i, color);
    });

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [quakes, radius, dummy, color]);

  if (count === 0) return null;

  return (
    <instancedMesh
      key={count}
      ref={meshRef}
      args={[undefined, undefined, count]}
    >
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial toneMapped={false} />
    </instancedMesh>
  );
}
