// Additive point-sprite glow — pin-light core + wide bloom.
export const glowVertexShader = /* glsl */ `
  attribute float aMag;
  attribute vec3 aColor;
  attribute float aBoost;
  uniform float uSize;
  uniform float uTime;
  varying float vMag;
  varying vec3 vColor;
  varying float vBoost;

  void main() {
    vMag = aMag;
    vColor = aColor;
    // Selected markers breathe slightly via aBoost > 1
    float pulse = aBoost > 1.0 ? (1.0 + 0.12 * sin(uTime * 2.8)) : 1.0;
    vBoost = aBoost * pulse;

    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    float magScale = 0.5 + pow(aMag / 8.0, 1.1) * 1.35;
    gl_PointSize = uSize * magScale * (1.0 + vBoost * 0.65) / max(0.4, -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const glowFragmentShader = /* glsl */ `
  varying float vMag;
  varying vec3 vColor;
  varying float vBoost;

  void main() {
    vec2 uv = gl_PointCoord - vec2(0.5);
    float d = length(uv);

    float core = exp(-d * d * 48.0);
    float mid  = exp(-d * d * 12.0);
    float halo = exp(-d * d * 4.5);
    float glow = core * 1.15 + mid * 0.55 + halo * 0.22;

    float magT = clamp(0.2 + pow(vMag / 8.0, 1.05), 0.2, 1.15);
    float intensity = glow * magT * (0.5 + vBoost * 0.75);

    if (intensity <= 0.01) discard;

    vec3 col = mix(vColor, vec3(1.0), core * 0.45);
    gl_FragColor = vec4(col, intensity);
  }
`;
