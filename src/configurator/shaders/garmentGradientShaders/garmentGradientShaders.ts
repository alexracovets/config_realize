const garmentGradientMapFragment = /* glsl */ `
#ifdef USE_GRADIENT
  vec2 partUv = ( vPrintUv - uPartUvBounds.xy ) / ( uPartUvBounds.zw - uPartUvBounds.xy );
  float gradMask = garmentGradientMask( partUv ) * uGradientEnabled;
  diffuseColor.rgb = mix( diffuseColor.rgb, uGradientColor2, gradMask );
#endif
`;

export { garmentGradientMapFragment };
