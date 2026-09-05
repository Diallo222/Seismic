// Soft luminous bead markers — bright facing disc, faint limb, instance color.
export const markerVertexShader = /* glsl */ `
  attribute mat4 instanceMatrix;
  attribute vec3 instanceColorAttr;

  varying vec3 vColor;
  varying vec3 vNormalW;
  varying vec3 vViewW;

  void main() {
    vColor = instanceColorAttr;

    mat4 world = modelMatrix * instanceMatrix;
    vec4 worldPos = world * vec4(position, 1.0);

    // Normal transform without non-uniform scale issues (markers scale uniformly)
    vNormalW = normalize(mat3(world) * normal);
    vViewW = cameraPosition - worldPos.xyz;

    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

export const markerFragmentShader = /* glsl */ `
  varying vec3 vColor;
  varying vec3 vNormalW;
  varying vec3 vViewW;

  void main() {
    vec3 n = normalize(vNormalW);
    vec3 v = normalize(vViewW);
    float facing = abs(dot(n, v));

    // Hot center when facing camera, soft falloff toward the limb.
    // Floor alpha high enough that beads stay readable without Glow.
    float core = pow(facing, 3.2);
    float rim = pow(1.0 - facing, 2.4);
    float alpha = clamp(0.45 + core * 0.75 + rim * 0.15, 0.0, 1.0);

    vec3 col = vColor * (0.5 + core * 1.25) + vec3(1.0) * core * 0.4;
    gl_FragColor = vec4(col, alpha);
  }
`;
