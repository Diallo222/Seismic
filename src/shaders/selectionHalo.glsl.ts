// Soft pulsing targeting reticle for the selected epicenter.
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

  float ring(float dist, float r, float w) {
    return smoothstep(r + w, r, dist) - smoothstep(r, r - w, dist);
  }

  void main() {
    vec2 p = (vUv - 0.5) * 2.0;
    float dist = length(p);
    float ang = atan(p.y, p.x);

    // Breathing outer + inner rings (tight so they hug the marker)
    float breathe = 0.5 + 0.5 * sin(uTime * 2.2);
    float rOuter = 0.48 + 0.045 * breathe;
    float rInner = 0.22 + 0.03 * (1.0 - breathe);

    float rings =
      ring(dist, rOuter, 0.035) * 0.95 +
      ring(dist, rInner, 0.028) * 0.7;

    // Four cardinal tick marks (reticle)
    float tickLen = 0.12;
    float tickW = 0.018;
    float onAxis =
      max(
        smoothstep(tickW, 0.0, abs(p.x)) * smoothstep(rOuter + 0.02, rOuter - tickLen, abs(p.y)) *
          (1.0 - smoothstep(rOuter - tickLen, rOuter - tickLen - 0.04, abs(p.y))),
        smoothstep(tickW, 0.0, abs(p.y)) * smoothstep(rOuter + 0.02, rOuter - tickLen, abs(p.x)) *
          (1.0 - smoothstep(rOuter - tickLen, rOuter - tickLen - 0.04, abs(p.x)))
      );

    // Soft rotating sweep wedge
    float sweep = fract(ang / 6.2831853 - uTime * 0.08);
    float wedge = smoothstep(0.0, 0.04, sweep) * smoothstep(0.18, 0.08, sweep);
    wedge *= smoothstep(rOuter, rInner, dist) * 0.25;

    float disc = smoothstep(1.05, 0.78, dist);
    float alpha = (rings + onAxis * 0.85 + wedge) * disc;
    if (alpha <= 0.004) discard;

    vec3 col = mix(uColor, vec3(1.0), onAxis * 0.35);
    gl_FragColor = vec4(col, alpha);
  }
`;
