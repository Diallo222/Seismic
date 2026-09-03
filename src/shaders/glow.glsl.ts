// Additive point-sprite glow — soft core + wide halo, magnitude-driven.
export const glowVertexShader = /* glsl */ `
  attribute float aMag;
  attribute vec3 aColor;
  attribute float aBoost;
  uniform float uSize;
  varying float vMag;
  varying vec3 vColor;
  varying float vBoost;

  void main() {
    vMag = aMag;
    vColor = aColor;
    vBoost = aBoost;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    float magScale = 0.55 + aMag * 0.22;
    gl_PointSize = uSize * magScale * (1.0 + vBoost * 0.55) / max(0.35, -mvPosition.z);
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

    // Tight hot core + soft outer bloom
    float core = 1.0 - smoothstep(0.0, 0.12, d);
    float mid  = 1.0 - smoothstep(0.0, 0.32, d);
    float halo = 1.0 - smoothstep(0.0, 0.5, d);
    float glow = core * 0.95 + mid * 0.45 + halo * 0.2;

    float magT = clamp(vMag / 8.0, 0.18, 1.0);
    float intensity = glow * magT * (0.55 + vBoost * 0.7);

    if (intensity <= 0.008) discard;

    // Slightly warm the rim so it matches the observatory HUD copper haze
    vec3 col = mix(vColor, vec3(0.88, 0.69, 0.45), core * 0.25);
    gl_FragColor = vec4(col, intensity);
  }
`;
