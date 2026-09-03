// Additive point-sprite glow at each epicenter, intensity/size driven by magnitude.
export const glowVertexShader = /* glsl */ `
  attribute float aMag;
  attribute vec3 aColor;
  uniform float uSize;
  varying float vMag;
  varying vec3 vColor;

  void main() {
    vMag = aMag;
    vColor = aColor;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = uSize * (aMag + 1.0) / -mvPosition.z;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const glowFragmentShader = /* glsl */ `
  varying float vMag;
  varying vec3 vColor;

  void main() {
    vec2 uv = gl_PointCoord - vec2(0.5);
    float d = length(uv);
    float glow = 1.0 - smoothstep(0.0, 0.5, d);
    float intensity = glow * clamp(vMag / 8.0, 0.2, 1.0);
    if (intensity <= 0.001) discard;
    gl_FragColor = vec4(vColor, intensity);
  }
`;
