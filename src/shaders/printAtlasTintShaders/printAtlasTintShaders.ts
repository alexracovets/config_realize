const printAtlasTintVertexShader = /* glsl */ `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const printAtlasTintFragmentShader = /* glsl */ `
uniform sampler2D uMap;
uniform vec3 uTint;
uniform float uOpacity;
uniform float uUseTint;

varying vec2 vUv;

void main() {
  vec4 tex = texture2D(uMap, vUv);

  if (uUseTint > 0.5) {
    gl_FragColor = vec4(uTint, tex.a) * uOpacity;
  } else {
    gl_FragColor = tex * uOpacity;
  }
}
`;

export { printAtlasTintFragmentShader, printAtlasTintVertexShader };
