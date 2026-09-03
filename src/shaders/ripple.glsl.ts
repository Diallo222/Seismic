// Expanding shockwave ring from an epicenter, fading over uDuration seconds.
// uPhase desyncs instances; uCycle makes it repeat so the globe stays alive.
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
  uniform vec3 uColor;
  varying vec2 vUv;

  void main() {
    float age = mod(uTime + uPhase, uCycle);
    if (age > uDuration) discard;

    vec2 centered = (vUv - 0.5) * 2.0;
    float dist = length(centered);

    float radius = age * uSpeed;
    float ring = smoothstep(radius, radius - 0.05, dist)
               - smoothstep(radius - 0.05, radius - 0.14, dist);
    float fade = 1.0 - clamp(age / uDuration, 0.0, 1.0);

    float alpha = ring * fade * smoothstep(1.05, 0.95, dist);
    if (alpha <= 0.001) discard;

    gl_FragColor = vec4(uColor, alpha);
  }
`;
