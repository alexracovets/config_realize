import { garmentLogoMapFragment, garmentNameMapFragment, garmentNumberMapFragment, garmentTestoMapFragment } from '@configurator/shaders';
const garmentPrintMapFragment =  `
#ifdef USE_PRINT
  vec4 printColor = vec4( 0.0 );
  garmentGizmoUiColor = vec4( 0.0 );

  vec4 layer0 = vec4(
    uPatternColor0,
    texture2D( uPatternMask0, vPrintUv ).a * uPatternOpacity
  );
  printColor = layer0;

  vec4 layer1 = vec4(
    uPatternColor1,
    texture2D( uPatternMask1, vPrintUv ).a * uPatternOpacity
  );
  printColor.rgb = layer1.rgb * layer1.a + printColor.rgb * ( 1.0 - layer1.a );
  printColor.a = layer1.a + printColor.a * ( 1.0 - layer1.a );

#ifdef USE_GARMENT_LOGO
${garmentLogoMapFragment}
#endif

#ifdef USE_GARMENT_NAME
${garmentNameMapFragment}
#endif

#ifdef USE_GARMENT_TESTO
${garmentTestoMapFragment}
#endif

#ifdef USE_GARMENT_NUMBER
${garmentNumberMapFragment}
#endif

  vec4 defaultDesign = texture2D( uDefaultLogos, vPrintUv );
  defaultDesign.a = step( 0.5, defaultDesign.a );
  garmentPrintColor = printColor;
  garmentPrintColor.rgb = defaultDesign.rgb * defaultDesign.a + garmentPrintColor.rgb * ( 1.0 - defaultDesign.a );
  garmentPrintColor.a = defaultDesign.a + garmentPrintColor.a * ( 1.0 - defaultDesign.a );
#endif
`;

const garmentPbrShadeCaptureFragment =  `
#ifdef USE_PRINT

  float diffuseLuma = max( max( totalDiffuse.r, totalDiffuse.g ), totalDiffuse.b );
  #ifdef USE_GRADIENT
  vec3 shadeAlbedo = garmentBaseAlbedo;
  #else
  vec3 shadeAlbedo = diffuseColor.rgb;
  #endif
  float albedoLuma = max( max( shadeAlbedo.r, shadeAlbedo.g ), shadeAlbedo.b );
  garmentPbrShade = clamp( diffuseLuma / max( albedoLuma, 0.001 ), 0.42, 1.0 );
#endif
`;

const garmentPrintLightsFragment =  `
#ifdef USE_PRINT
  vec3 flatBase = diffuseColor.rgb;
  vec3 flatComposite = garmentPrintColor.rgb * garmentPrintColor.a + flatBase * ( 1.0 - garmentPrintColor.a );
  gl_FragColor.rgb = flatComposite * garmentPbrShade;
  gl_FragColor.a = garmentPrintColor.a + gl_FragColor.a * ( 1.0 - garmentPrintColor.a );
#endif
`;

export { garmentPbrShadeCaptureFragment, garmentPrintLightsFragment, garmentPrintMapFragment };
