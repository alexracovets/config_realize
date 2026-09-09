const garmentGradientMapFragment = `
#ifdef USE_GRADIENT
  float gradMask = garmentGradientMask( garmentGradientWorldT( vGarmentWorldPos ) ) * uGradientEnabled;
  diffuseColor.rgb = mix( diffuseColor.rgb, uGradientColor2, gradMask );
#endif
`;

export { garmentGradientMapFragment };
