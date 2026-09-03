// Expanding shockwave ring — thin crisp ring with soft trailing edge.
export const rippleVertexShader = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const rippleFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uPhase;
  uniform float uCycle;
  uniform float uDuration;
  uniform float uSpeed;
  uniform float uMag;
  uniform vec3 uColor;
  varying vec2 vUv;

  void main() {
    float age = mod(uTime + uPhase, uCycle);
    if (age > uDuration) discard;

    vec2 centered = (vUv - 0.5) * 2.0;
    float dist = length(centered);

    float radius = age * uSpeed;
    // Thin leading edge + soft wake
    float ring =
      smoothstep(radius + 0.02, radius, dist) -
      smoothstep(radius, radius - 0.08, dist);

    float fade = pow(1.0 - clamp(age / uDuration, 0.0, 1.0), 1.35);
    float magBoost = clamp(uMag / 7.0, 0.35, 1.15);
    float disc = smoothstep(1.05, 0.9, dist);

    float alpha = ring * fade * disc * magBoost;
    if (alpha <= 0.004) discard;

    gl_FragColor = vec4(uColor, alpha);
  }
`;
