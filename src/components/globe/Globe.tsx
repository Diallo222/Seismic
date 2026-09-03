import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import type { ComponentRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useTexture } from "@react-three/drei";
import * as THREE from "three";
import type { Quake } from "../../lib/types";
import { latLngToVec3 } from "../../lib/geo";
import { useDashboardStore } from "../../store/useDashboardStore";
import {
  atmosphereFragmentShader,
  atmosphereVertexShader,
} from "../../shaders/atmosphere.glsl";
import { Markers } from "./Markers";
import { Glow } from "./Glow";
import { Ripples } from "./Ripples";
import { SelectionHalo } from "./SelectionHalo";
import { CameraRig } from "./CameraRig";
import { EpicenterTracker } from "./EpicenterTracker";

const GLOBE_RADIUS = 2;
const MARKER_RADIUS = GLOBE_RADIUS * 1.018; // sit just above the surface
const ATMOSPHERE_SCALE = 1.15;

// Public-domain earth day map, served from three.js's own examples (CORS-enabled).
const EARTH_TEXTURE_URL =
  "https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg";

function Earth() {
  const texture = useTexture(EARTH_TEXTURE_URL);
  return (
    <mesh>
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

/** Fresnel rim glow — a slightly larger sphere, back-side + additive. */
function Atmosphere() {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uColor: { value: new THREE.Color("#D4A574") },
          uPower: { value: 4 },
        },
        vertexShader: atmosphereVertexShader,
        fragmentShader: atmosphereFragmentShader,
        transparent: true,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    [],
  );

  useEffect(() => () => material.dispose(), [material]);

  return (
    <mesh scale={ATMOSPHERE_SCALE}>
      <sphereGeometry args={[GLOBE_RADIUS, 64, 64]} />
      <primitive object={material} attach="material" />
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

// The globe is heavy on phones — drop the shader-driven glow/ripple layers
// there and keep solid markers, per project.md §9.
const MOBILE_QUERY = "(max-width: 767px)";
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    () => window.matchMedia(MOBILE_QUERY).matches,
  );
  useEffect(() => {
    const mql = window.matchMedia(MOBILE_QUERY);
    const onChange = () => setIsMobile(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);
  return isMobile;
}

export function Globe({ quakes }: { quakes: Quake[] }) {
  const tabVisible = useTabVisible();
  const isMobile = useIsMobile();
  const controlsRef = useRef<ComponentRef<typeof OrbitControls>>(null);

  const selectedId = useDashboardStore((s) => s.selectedId);
  const selected = quakes.find((q) => q.id === selectedId) ?? null;

  const flyTarget = useMemo(
    () => (selected ? latLngToVec3(selected.lat, selected.lng, 1) : null),
    [selected],
  );

  return (
    <div className="absolute inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 45 }}
        dpr={isMobile ? [1, 1.5] : [1, 2]}
        frameloop={tabVisible ? "always" : "never"}
        gl={{ antialias: true, alpha: false }}
        onCreated={({ gl }) => {
          gl.setClearColor("#080706");
        }}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
        }}
      >
        <ambientLight intensity={0.45} />
        <directionalLight position={[5, 3, 5]} intensity={1.35} />
        <Suspense fallback={<GlobeFallback />}>
          <Earth />
        </Suspense>
        <Atmosphere />
        <Markers quakes={quakes} radius={MARKER_RADIUS} />
        {!isMobile && (
          <>
            <Glow quakes={quakes} radius={MARKER_RADIUS} />
            <Ripples quakes={quakes} radius={MARKER_RADIUS} />
            {selected && (
              <SelectionHalo quake={selected} radius={MARKER_RADIUS} />
            )}
          </>
        )}
        {isMobile && selected && (
          <SelectionHalo quake={selected} radius={MARKER_RADIUS} />
        )}
        <CameraRig target={flyTarget} />
        <EpicenterTracker quake={selected} />
        <OrbitControls
          ref={controlsRef}
          enablePan={false}
          minDistance={3}
          maxDistance={12}
          autoRotate={!selected}
          autoRotateSpeed={0.4}
        />
      </Canvas>
    </div>
  );
}
