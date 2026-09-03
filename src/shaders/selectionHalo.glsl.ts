// Soft pulsing halo for the currently selected epicenter.
export const selectionHaloVertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const selectionHaloFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform vec3 uColor;
  varying vec2 vUv;

  void main() {
    vec2 centered = (vUv - 0.5) * 2.0;
    float dist = length(centered);

    // Two breathing rings out of phase
    float r1 = 0.35 + 0.12 * sin(uTime * 2.4);
    float r2 = 0.55 + 0.1 * sin(uTime * 2.4 + 1.2);

    float ring1 =
      smoothstep(r1 + 0.03, r1, dist) -
      smoothstep(r1, r1 - 0.06, dist);
    float ring2 =
      smoothstep(r2 + 0.025, r2, dist) -
      smoothstep(r2, r2 - 0.05, dist);

    float disc = smoothstep(1.0, 0.82, dist);
    float alpha = (ring1 * 0.9 + ring2 * 0.45) * disc;
    if (alpha <= 0.004) discard;

    gl_FragColor = vec4(uColor, alpha);
  }
`;
