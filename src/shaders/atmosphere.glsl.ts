// Fresnel rim glow — brightest at grazing angles, rendered back-side + additive
// on a sphere slightly larger than the globe.
export const atmosphereVertexShader = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vPositionW;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vPositionW = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const atmosphereFragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform float uPower;
  varying vec3 vNormal;
  varying vec3 vPositionW;

  void main() {
    // BackSide geometry: dot(normal, viewDir) runs 0 (silhouette) to -1 (disc
    // center) — no clamp needed, +1 maps that straight onto a 0..1 falloff.
    vec3 viewDir = normalize(vPositionW);
    float intensity = pow(dot(vNormal, viewDir) + 1.0, uPower);
    gl_FragColor = vec4(uColor, intensity);
  }
`;
