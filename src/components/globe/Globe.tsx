import { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useTexture } from "@react-three/drei";
import type { Quake } from "../../lib/types";
import { Markers } from "./Markers";

const GLOBE_RADIUS = 2;
const MARKER_RADIUS = GLOBE_RADIUS * 1.01; // sit just above the surface

// Public-domain earth day map, served from three.js's own examples (CORS-enabled).
const EARTH_TEXTURE_URL =
  "https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg";

function Earth() {
  const texture = useTexture(EARTH_TEXTURE_URL);
  return (
    <mesh rotation={[0, Math.PI, 0]}>
      <sphereGeometry args={[GLOBE_RADIUS, 64, 64]} />
      <meshStandardMaterial map={texture} roughness={0.9} metalness={0} />
    </mesh>
  );
}

function GlobeFallback() {
  return (
    <mesh>
      <sphereGeometry args={[GLOBE_RADIUS, 32, 32]} />
      <meshBasicMaterial color="#1e293b" wireframe />
    </mesh>
  );
}

/** Pause the render loop while the tab is hidden — saves battery/GPU. */
function useTabVisible() {
  const [visible, setVisible] = useState(!document.hidden);
  useEffect(() => {
    const onChange = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", onChange);
    return () => document.removeEventListener("visibilitychange", onChange);
  }, []);
  return visible;
}

export function Globe({ quakes }: { quakes: Quake[] }) {
  const tabVisible = useTabVisible();

  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 45 }}
      dpr={[1, 2]}
      frameloop={tabVisible ? "always" : "never"}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 3, 5]} intensity={1.5} />
      <Suspense fallback={<GlobeFallback />}>
        <Earth />
        <Markers quakes={quakes} radius={MARKER_RADIUS} />
      </Suspense>
      <OrbitControls
        enablePan={false}
        minDistance={3}
        maxDistance={12}
        autoRotate
        autoRotateSpeed={0.4}
      />
    </Canvas>
  );
}
